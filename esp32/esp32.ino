#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <time.h>
#include <DNSServer.h>

// ════════════ HARDWARE ════════════
#define PIN_BUTTON_CONFIG 0   
#define PIN_RFID_SS       15
#define PIN_RFID_RST      27
#define PIN_LED_G         2   
#define PIN_LED_R         4   
#define PIN_LED_Y         13  
#define PIN_LED_W         12  
#define PIN_BUTTON_OP     14  

// ════════════ CONSTANTES ════════════
#define MQTT_PORT               1883
#define NTP_SERVER              "pool.ntp.org"
#define GMT_OFFSET              -10800  
#define TIMEOUT_MS              5000    
#define TIME_TO_RESET           3000
#define DNS_PORT                53 
#define AUTO_RECONNECT_INTERVAL 60000 

// ════════════ GLOBAIS ════════════
LiquidCrystal_I2C lcd(0x27, 16, 2);
MFRC522 rfid(PIN_RFID_SS, PIN_RFID_RST);
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
Preferences prefs_room;   
Preferences prefs_sys;    
WebServer server(80);
DNSServer dnsServer;

// ════════════ VARIÁVEIS ════════════
String config_ssid = "";
String config_pass = "";
String config_server_ip = "";
String config_room_str = "";
int    config_room_id = 0;
String admin_pass = "";

// Variável Global do Nome da Sala (É esta que o LCD lê)
String custom_room_name = ""; 

String global_ssid_options = "<option value=''>Clique em 'Buscar Redes'</option>";

// ════════════ HTML ════════════
const char* html_login = R"raw(
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Login ESP32</title>
<style>body{background-color:#0f172a;color:#f1f5f9;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}.card{background-color:#1e293b;padding:2rem;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);width:100%;max-width:350px;text-align:center;border:1px solid #334155}h2{color:#38bdf8;margin-bottom:1.5rem;text-transform:uppercase;letter-spacing:1px;font-size:1.5rem}input{width:100%;padding:12px;margin:8px 0;background-color:#0f172a;border:1px solid #475569;color:#fff;border-radius:6px;box-sizing:border-box;outline:none}input:focus{border-color:#38bdf8}button{width:100%;padding:12px;margin-top:15px;background-color:#2563eb;color:white;border:none;border-radius:6px;font-weight:bold;cursor:pointer}button:hover{background-color:#1d4ed8}</style>
</head><body><div class="card"><h2>Acesso Restrito</h2><form action="/config" method="POST"><input type="text" name="user" placeholder="Usuário" required><input type="password" name="pass" placeholder="Senha" required><button type="submit">ENTRAR</button></form></div></body></html>
)raw";

String getPageConfig(String current_pass) {
  String html = R"raw(
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Configuração</title>
<style>body{background-color:#0f172a;color:#f1f5f9;font-family:'Segoe UI',sans-serif;padding:20px;display:flex;justify-content:center}.card{background-color:#1e293b;padding:2rem;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);width:100%;max-width:400px;border:1px solid #334155}h2{color:#38bdf8;text-align:center;margin-top:0}h3{color:#94a3b8;font-size:0.9rem;text-transform:uppercase;border-bottom:1px solid #334155;padding-bottom:5px;margin-top:20px}input,select{width:100%;padding:10px;margin:5px 0;background-color:#0f172a;border:1px solid #475569;color:#fff;border-radius:6px;box-sizing:border-box;outline:none}input:focus,select:focus{border-color:#38bdf8}.warn{color:#f87171;font-size:0.85rem;margin-bottom:5px}button{width:100%;padding:12px;margin-top:20px;background-color:#10b981;color:white;border:none;border-radius:6px;font-weight:bold;cursor:pointer}button:hover{background-color:#059669}.btn-scan{background-color:#6366f1;margin-top:0;margin-bottom:15px}.btn-scan:hover{background-color:#4f46e5}.checkbox-wrapper{display:flex;align-items:center;margin-bottom:10px;font-size:0.9rem;color:#94a3b8}.checkbox-wrapper input{width:auto;margin-right:10px}a.toggle-link{color:#38bdf8;font-size:0.85rem;text-decoration:none;cursor:pointer;display:block;text-align:right;margin-top:-3px;margin-bottom:10px}a.toggle-link:hover{text-decoration:underline}</style>
<script>function togglePass(){var x=document.getElementById("wpassInput");if(x.type==="password"){x.type="text"}else{x.type="password"}}function toggleManual(){var boxSelect=document.getElementById("boxSelect");var boxManual=document.getElementById("boxManual");var sel=document.getElementById("ssidSelect");var inp=document.getElementById("ssidInput");if(boxSelect.style.display==="none"){boxSelect.style.display="block";boxManual.style.display="none";sel.disabled=false;inp.disabled=true}else{boxSelect.style.display="none";boxManual.style.display="block";sel.disabled=true;inp.disabled=false}}</script>
</head><body><div class="card"><h2>Configuração Atual</h2><form action="/config" method="POST"><input type="hidden" name="user" value="admin"><input type="hidden" name="pass" value=")raw" + current_pass + R"raw("><input type="hidden" name="scan" value="true"><button type="submit" class="btn-scan">🔍 Buscar Redes Wi-Fi</button></form><form action="/save" method="POST"><h3>Conectividade</h3><label style="color:#94a3b8;font-size:0.9rem">Rede Wi-Fi:</label><div id="boxSelect"><select id="ssidSelect" name="ssid">)raw" + global_ssid_options + R"raw(</select><a class="toggle-link" onclick="toggleManual()">Minha rede não aparece / Digitar manual</a></div><div id="boxManual" style="display:none"><input id="ssidInput" type="text" name="ssid" placeholder="Digite o nome da rede (SSID)" disabled><a class="toggle-link" onclick="toggleManual()">Voltar para lista</a></div><input type="password" id="wpassInput" name="wpass" placeholder="Senha do Wi-Fi"><div class="checkbox-wrapper"><input type="checkbox" onclick="togglePass()"> Mostrar senha</div><label style="color:#94a3b8;font-size:0.9rem">Servidor MQTT:</label><input type="text" name="srv_ip" value=")raw" + config_server_ip + R"raw(" required pattern="^([0-9]{1,3}\.){3}[0-9]{1,3}$" title="Formato IP ex: 192.168.0.10"><h3>Localização</h3><label style="color:#94a3b8;font-size:0.9rem">ID da Sala:</label><input type="number" name="room" value=")raw" + config_room_str + R"raw(" required><h3>Segurança</h3><p class="warn">Senha Admin:</p><input type="password" name="new_admin_pass" placeholder="Nova Senha Admin" required><button type="submit">SALVAR ALTERAÇÕES</button></form></div></body></html>
)raw";
  return html;
}

// ════════════ SUPORTE ════════════
void loadConfig() {
  prefs_sys.begin("system", true);
  config_ssid = prefs_sys.getString("ssid", "");
  config_pass = prefs_sys.getString("wpass", "");
  config_server_ip = prefs_sys.getString("srv_ip", "");
  config_room_str = prefs_sys.getString("room", "1");
  config_room_id = config_room_str.toInt();
  admin_pass = prefs_sys.getString("admin_pass", "admin");
  // Carrega o nome da sala salvo anteriormente
  custom_room_name = prefs_sys.getString("c_name", ""); 
  prefs_sys.end();
}

void factoryReset() {
  Serial.println("Resetando...");
  prefs_sys.begin("system", false); prefs_sys.clear(); prefs_sys.end();
  prefs_room.begin("room", false); prefs_room.clear(); prefs_room.end();
  ESP.restart();
}

void handleRoot() { server.send(200, "text/html; charset=utf-8", html_login); }
void handleConfig() {
  if (!server.hasArg("user") || !server.hasArg("pass")) { server.send(400, "text/plain", "Faltam credenciais"); return; }
  String pass_received = server.arg("pass");
  if (server.arg("user") == "admin" && pass_received == admin_pass) {
    if (server.hasArg("scan") && server.arg("scan") == "true") {
       int n = WiFi.scanNetworks(); 
       String newOptions = "";
       if (n == 0) newOptions = "<option value=''>Nenhuma rede encontrada</option>";
       else {
         for (int i = 0; i < n; ++i) {
            String item_ssid = WiFi.SSID(i);
            String selected = (item_ssid == config_ssid) ? " selected" : "";
            newOptions += "<option value='" + item_ssid + "'" + selected + ">" + item_ssid + " (" + String(WiFi.RSSI(i)) + "dBm)</option>";
         }
       }
       global_ssid_options = newOptions;
    }
    server.send(200, "text/html; charset=utf-8", getPageConfig(pass_received));
  } else { server.send(403, "text/html; charset=utf-8", "Acesso Negado"); }
}
void handleSave() {
  String n_ssid = server.arg("ssid"); String n_wpass = server.arg("wpass"); String n_srv = server.arg("srv_ip"); String n_room = server.arg("room"); String n_adm = server.arg("new_admin_pass");
  if (n_ssid.length() > 0 && n_adm.length() > 0) {
    prefs_sys.begin("system", false); prefs_sys.putString("ssid", n_ssid);
    if (n_wpass.length() > 0) prefs_sys.putString("wpass", n_wpass);
    prefs_sys.putString("srv_ip", n_srv); prefs_sys.putString("room", n_room); prefs_sys.putString("admin_pass", n_adm); prefs_sys.end();
    server.send(200, "text/html; charset=utf-8", "<h1>Atualizado!</h1><p>Reiniciando...</p>"); delay(2000); ESP.restart();
  } else { server.send(400, "text/plain", "Dados inválidos"); }
}

// ════════════ CLASSE PRINCIPAL ════════════

enum Mode { NORMAL, REGISTRATION };

class AccessControl {
private:
    static AccessControl* instance;
    Mode currentMode = NORMAL;
    bool waitingResponse = false;        
    unsigned long requestStartTime = 0; 
    byte lastUid[4];
    unsigned long lastButtonPress = 0;
    unsigned long lastRfidCheck = 0;
    unsigned long lastSyncAttempt = 0; 
    bool rfidWasMissing = false; 
    bool pendingExitSync = false; 
    String pendingExitUid = "";
    bool inFallbackMode = false;
    unsigned long lastAutoConnect = 0;

public:
    AccessControl() { instance = this; }

    void init() {
        Serial.begin(115200);
        
        pinMode(PIN_LED_G, OUTPUT); pinMode(PIN_LED_R, OUTPUT); 
        pinMode(PIN_LED_Y, OUTPUT); pinMode(PIN_LED_W, OUTPUT);
        pinMode(PIN_BUTTON_OP, INPUT_PULLUP); pinMode(PIN_BUTTON_CONFIG, INPUT_PULLUP);
        
        digitalWrite(PIN_LED_G, LOW); digitalWrite(PIN_LED_R, LOW); 
        digitalWrite(PIN_LED_Y, LOW); digitalWrite(PIN_LED_W, LOW);

        Wire.begin(); lcd.init(); lcd.backlight();
        
        loadConfig();
        updateUI(); 

        if (digitalRead(PIN_BUTTON_CONFIG) == LOW) { runManualConfigMode(); return; } 
        if (config_ssid == "") { runManualConfigMode(); return; }

        SPI.begin(); 
        rfid.PCD_Init();
        if (!checkRfidHardware()) { digitalWrite(PIN_LED_Y, HIGH); showLcd("Erro Hardware", "Verificar RFID"); }

        connectNetwork(false); 
        
        if (WiFi.status() != WL_CONNECTED) { 
            Serial.println("Falha na conexao. Ativando Modo Fallback."); 
            startFallbackMode();
        } 

        syncTime(); 
        if (!pendingExitSync) updateUI();
        
        Serial.println("[SYS] Sistema Iniciado");
    }

    void loop() {
        yield();
        if (digitalRead(PIN_BUTTON_CONFIG) == LOW) { delay(TIME_TO_RESET); if (digitalRead(PIN_BUTTON_CONFIG) == LOW) factoryReset(); }

        if (inFallbackMode) {
            dnsServer.processNextRequest();
            server.handleClient();
            if (millis() - lastAutoConnect > AUTO_RECONNECT_INTERVAL) {
                WiFi.begin(config_ssid.c_str(), config_pass.c_str());
                lastAutoConnect = millis();
            }
            if (WiFi.status() == WL_CONNECTED) {
                WiFi.mode(WIFI_STA); digitalWrite(PIN_LED_W, LOW); inFallbackMode = false;
                connectNetwork(true);
            }
        } else {
            handleNetworkAndSync();
        }

        checkPhysicalButton(); checkTimeout(); checkRfidHealth();

        if (Serial.available()) handleSerial(toupper(Serial.read()));

        if (pendingExitSync) { 
            static unsigned long blinkTimer = 0; 
            if (millis() - blinkTimer > 1000) { showLcd("Sala Livre", "Sincronizando..."); blinkTimer = millis(); } 
            return; 
        }

        if (waitingResponse || rfidWasMissing) return;
        if (!rfid.PICC_IsNewCardPresent()) return; 
        if (!rfid.PICC_ReadCardSerial()) return;
        
        memcpy(lastUid, rfid.uid.uidByte, 4); processCardLogic(); rfid.PICC_HaltA(); rfid.PCD_StopCrypto1(); 
    }

private:
    void startFallbackMode() {
        inFallbackMode = true;
        digitalWrite(PIN_LED_W, HIGH); 
        WiFi.mode(WIFI_AP_STA); 
        WiFi.softAP("ESP32-Config", NULL);
        dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
        server.on("/", HTTP_GET, handleRoot); server.on("/config", HTTP_POST, handleConfig); server.on("/save", HTTP_POST, handleSave); server.onNotFound([]() { handleRoot(); });
        server.begin();
        lastAutoConnect = millis();
    }

    void runManualConfigMode() {
        Serial.println("Modo MANUAL");
        digitalWrite(PIN_LED_W, HIGH);
        WiFi.mode(WIFI_AP);
        WiFi.softAP("ESP32-Config", NULL);
        lcd.clear(); lcd.setCursor(0, 0); lcd.print("MODO CONFIG MAN."); lcd.setCursor(0, 1); lcd.print("192.168.4.1");
        dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
        server.on("/", HTTP_GET, handleRoot); server.on("/config", HTTP_POST, handleConfig); server.on("/save", HTTP_POST, handleSave); server.onNotFound([]() { handleRoot(); });
        server.begin();
        while (true) {
          dnsServer.processNextRequest(); server.handleClient();
          if (digitalRead(PIN_BUTTON_CONFIG) == LOW) { delay(TIME_TO_RESET); if (digitalRead(PIN_BUTTON_CONFIG) == LOW) factoryReset(); }
          delay(2);
        }
    }

    String sanitizeText(String text) {
        text.replace("á", "a"); text.replace("à", "a"); text.replace("ã", "a"); text.replace("â", "a");
        text.replace("é", "e"); text.replace("ê", "e"); text.replace("í", "i");
        text.replace("ó", "o"); text.replace("õ", "o"); text.replace("ô", "o");
        text.replace("ú", "u"); text.replace("ç", "c");
        text.replace("Á", "A"); text.replace("À", "A"); text.replace("Ã", "A"); text.replace("Â", "A");
        text.replace("É", "E"); text.replace("Ê", "E"); text.replace("Í", "I");
        text.replace("Ó", "O"); text.replace("Õ", "O"); text.replace("Ô", "O");
        text.replace("Ú", "U"); text.replace("Ç", "C"); return text;
    }

    void handleNetworkAndSync() { 
        if (!mqtt.connected()) { if (millis() - lastSyncAttempt > 2000) { connectNetwork(true); lastSyncAttempt = millis(); } } 
        else { 
            mqtt.loop(); 
            if (pendingExitSync) { 
                if (millis() - lastSyncAttempt > 3000) { 
                    sendRequest("register-exit/request", pendingExitUid.c_str(), false, true); 
                    lastSyncAttempt = millis(); 
                } 
            } 
        } 
    }

    void connectNetwork(bool nonBlocking) { 
        if (WiFi.status() != WL_CONNECTED) { 
            digitalWrite(PIN_LED_Y, HIGH); 
            if (!nonBlocking) { 
                showLcd("Conectando WiFi", config_ssid); 
                WiFi.begin(config_ssid.c_str(), config_pass.c_str()); 
                unsigned long start = millis(); 
                while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) { delay(500); yield(); } 
            } else { if (WiFi.status() != WL_CONNECTED) WiFi.begin(config_ssid.c_str(), config_pass.c_str()); } 
        } 
        if (WiFi.status() == WL_CONNECTED && !mqtt.connected()) { 
            mqtt.setServer(config_server_ip.c_str(), MQTT_PORT); 
            mqtt.setCallback(mqttCallbackStatic); 
            String id = "ESP32-" + String((uint32_t)ESP.getEfuseMac(), HEX); 
            if (mqtt.connect(id.c_str())) { 
                Serial.println(F("[MQTT] Conectado!")); 
                subscribeTopics(); 
                digitalWrite(PIN_LED_Y, LOW); 
                if (!pendingExitSync) updateUI(); 
            } 
        } 
    }

    void resetLocalState() { 
        prefs_room.begin("room", true); String savedUid = prefs_room.getString("uid", ""); prefs_room.end(); 
        if (savedUid == "" && !pendingExitSync) { rfid.PCD_Init(); rfidWasMissing = true; return; } 
        pendingExitUid = savedUid != "" ? savedUid : "FORCE_RESET"; pendingExitSync = true; 
        prefs_room.begin("room", false); prefs_room.clear(); prefs_room.end(); 
        rfid.PCD_Init(); blinkLed(PIN_LED_G); setLeds(); lastSyncAttempt = 0; 
    }

    void checkRfidHealth() { if (millis() - lastRfidCheck > 1000) { bool currentStatus = checkRfidHardware(); if (!currentStatus) { if (!rfidWasMissing) { digitalWrite(PIN_LED_Y, HIGH); rfidWasMissing = true; rfid.PCD_Init(); } } else { if (rfidWasMissing) { rfid.PCD_Init(); if (WiFi.status() == WL_CONNECTED && mqtt.connected()) digitalWrite(PIN_LED_Y, LOW); rfidWasMissing = false; } } lastRfidCheck = millis(); } }
    bool checkRfidHardware() { byte v = rfid.PCD_ReadRegister(rfid.VersionReg); return (v != 0x00 && v != 0xFF); }

    void handleMqtt(char* topicStr, byte* payload, unsigned int len) { 
        String topic = String(topicStr); 
        if (topic.endsWith("activate-creation-mode")) { currentMode = REGISTRATION; updateUI(); return; } 
        if (topic.endsWith("force-free")) { resetLocalState(); return; } 
        
        if (topic.endsWith("/message")) { 
            char msgBuffer[len + 1]; memcpy(msgBuffer, payload, len); msgBuffer[len] = '\0'; 
            StaticJsonDocument<256> msgDoc; 
            if (!deserializeJson(msgDoc, msgBuffer)) showLcd(msgDoc["l1"] | "Aviso:", msgDoc["l2"] | String(msgBuffer)); 
            else showLcd("Mensagem:", String(msgBuffer)); 
            return; 
        } 
        
        StaticJsonDocument<1024> doc; DeserializationError err = deserializeJson(doc, payload); if (err) return; 
        const char* status = doc["status"]; if (!status) status = doc["data"]["status"]; if (!status) status = "error"; 
        const char* serverMsg = doc["message"]; if (!serverMsg) serverMsg = doc["data"]["message"]; 
        bool success = (strcmp(status, "ok") == 0); 

        if (success) { 
            // ──────────────── CAPTURA DO NOME DA SALA (CORRIGIDO) ────────────────
            // Extrai classroom_name usando .as<String>() para segurança
            String newName = doc["data"]["classroom_name"].as<String>();
            
            // Valida se o nome é útil (não vazio, não "null")
            if (newName.length() > 0 && newName != "null") {
                // Se mudou, atualiza a GLOBAL e salva
                if (newName != custom_room_name) {
                    Serial.print("NOME SALVO: "); Serial.println(newName);
                    custom_room_name = newName;
                    prefs_sys.begin("system", false);
                    prefs_sys.putString("c_name", custom_room_name);
                    prefs_sys.end();
                }
            }
            // ──────────────────────────────────────────────────────────────────

            if (topic.indexOf("register-exit") > 0) { 
                pendingExitSync = false; prefs_room.begin("room", false); prefs_room.clear(); prefs_room.end(); 
                blinkLed(PIN_LED_G); 
                if (serverMsg) showLcd("Sucesso", String(serverMsg)); else showLcd("Sucesso", "Saida OK"); 
                delay(1500); 
            } 
           else if (topic.indexOf("register-entry") > 0) {
    // 1. Extração do Nome do Professor 
    const char* teacher = doc["data"]["teacher_name"];
    if (!teacher) teacher = doc["data"]["data"]["teacher_name"];
    if (!teacher) teacher = "Professor";

    // 2. NOVA LÓGICA: Extração do Nome da Sala (Igual à do professor)
    const char* roomName = doc["data"]["classroom_name"];
    if (!roomName) roomName = doc["data"]["data"]["classroom_name"];

    // Se encontrou um nome de sala válido, salva na memória permanente
    if (roomName && strlen(roomName) > 0) {
        String newNameStr = String(roomName);
        // Só grava na flash se o nome for diferente do atual 
        if (newNameStr != custom_room_name) {
            custom_room_name = newNameStr;
            prefs_sys.begin("system", false);
            prefs_sys.putString("c_name", custom_room_name);
            prefs_sys.end();
            Serial.print("Nome da sala atualizado para: ");
            Serial.println(custom_room_name);
        }
    }

    // 3. Salva o registro de entrada 
    char uidStr[10]; 
    formatUid(lastUid, uidStr);
    
    prefs_room.begin("room", false); 
    prefs_room.putString("uid", uidStr); 
    prefs_room.putString("teacher", teacher); 
    prefs_room.putULong("time", time(NULL)); 
    prefs_room.end();
    
    blinkLed(PIN_LED_G); 
}
            else if (topic.indexOf("create-card") > 0) { 
                currentMode = NORMAL; blinkLed(PIN_LED_G); showLcd("Cadastro OK", "Sucesso"); delay(1500); 
            } 
        } else { 
            blinkLed(PIN_LED_R); String errorMsg = "Falha"; 
            if (serverMsg) errorMsg = String(serverMsg); else { if (topic.indexOf("create-card") > 0) errorMsg = "Falha Cadastro"; else errorMsg = "Acesso Negado"; } 
            String fullText = "Erro: " + errorMsg; fullText = sanitizeText(fullText); 
            lcd.clear(); lcd.setCursor(0, 0); lcd.print(fullText.substring(0, 16)); 
            if (fullText.length() > 16) { lcd.setCursor(0, 1); lcd.print(fullText.substring(16, 32)); } 
            delay(2500); if (topic.indexOf("create-card") > 0) currentMode = NORMAL; 
        } 
        waitingResponse = false; updateUI(); 
    }

    void checkTimeout() { 
        if (waitingResponse && (millis() - requestStartTime > TIMEOUT_MS)) { 
            showLcd("Sem Resposta", "Servidor Offline"); blinkLed(PIN_LED_Y); waitingResponse = false; rfid.PCD_Init(); delay(1500); updateUI(); 
        } 
    }

    void processCardLogic() { 
        char uidStr[10]; formatUid(lastUid, uidStr); 
        if (currentMode == REGISTRATION) { sendRequest("create-card/request", uidStr, true, true); showLcd("Cadastrando...", "Aguarde"); return; } 
        prefs_room.begin("room", true); String savedUid = prefs_room.getString("uid", ""); prefs_room.end(); 
        if (savedUid == "") { sendRequest("register-entry/request", uidStr, false, true); showLcd("Verificando...", "Aguarde"); } 
        else if (savedUid == String(uidStr)) { sendRequest("register-exit/request", uidStr, false, true); showLcd("Saindo...", "Aguarde"); } 
        else { blinkLed(PIN_LED_R); showLcd("OCUPADO!", "Outro Cartao"); delay(2000); updateUI(); } 
    }

    void subscribeTopics() { 
        char topic[100]; sprintf(topic, "classroom/%d/create-card/response", config_room_id); mqtt.subscribe(topic); 
        sprintf(topic, "classroom/%d/register-entry/response", config_room_id); mqtt.subscribe(topic); 
        sprintf(topic, "classroom/%d/register-exit/response", config_room_id); mqtt.subscribe(topic); 
        sprintf(topic, "classroom/%d/activate-creation-mode", config_room_id); mqtt.subscribe(topic); 
        sprintf(topic, "classroom/%d/force-free", config_room_id); mqtt.subscribe(topic); 
        sprintf(topic, "classroom/%d/message", config_room_id); mqtt.subscribe(topic); 
    }

    void sendRequest(const char* actionSuffix, const char* uid, bool isCreate, bool waitForReply) { 
        StaticJsonDocument<512> doc; char timeStr[35]; getIsoTime(timeStr); 
        if (isCreate) { doc["pattern"] = "create-card/request"; doc["data"]["uid"] = uid; } 
        else { 
            if (String(actionSuffix).indexOf("entry") >= 0) { doc["pattern"] = "entry/register/request"; doc["data"]["entry_datetime"] = timeStr; } 
            else { doc["pattern"] = "exit/register/request"; doc["data"]["exit_datetime"] = timeStr; } 
            doc["data"]["classroom_id"] = config_room_id; doc["data"]["card_uid"] = uid; 
        } 
        char payload[512]; serializeJson(doc, payload); char topic[100]; sprintf(topic, "classroom/%d/%s", config_room_id, actionSuffix); 
        if (mqtt.publish(topic, payload)) { if (waitForReply) { waitingResponse = true; requestStartTime = millis(); } } 
        else { if (waitForReply && !pendingExitSync) { showLcd("Erro MQTT", "Falha Envio"); blinkLed(PIN_LED_Y); delay(1000); updateUI(); } } 
    }

    static void mqttCallbackStatic(char* topic, byte* payload, unsigned int length) { if (instance) instance->handleMqtt(topic, payload, length); }
    void checkPhysicalButton() { if (digitalRead(PIN_BUTTON_OP) == LOW) { if (millis() - lastButtonPress > 2000) { lastButtonPress = millis(); resetLocalState(); rfid.PCD_Init(); rfidWasMissing = true; } } }
    
    void syncTime() { configTime(GMT_OFFSET, 0, NTP_SERVER); }
    
    void updateUI() { 
        if (waitingResponse || pendingExitSync) return; 
        setLeds(); 
        prefs_room.begin("room", true); String teacher = prefs_room.getString("teacher", ""); time_t entryTime = prefs_room.getULong("time", 0); prefs_room.end(); 
        
        if (inFallbackMode) { lcd.setCursor(0, 0); lcd.print("MODO OFFLINE"); } 
        else {
             if (currentMode == REGISTRATION) { showLcd("MODO CADASTRO", "Aproxime Cartao"); } 
             else if (teacher != "") { 
                 struct tm* ti = localtime(&entryTime); char timeBuf[6]; snprintf(timeBuf, 6, "%02d:%02d", ti->tm_hour, ti->tm_min); 
                 showLcd("OCUPADO: " + teacher, "Desde: " + String(timeBuf)); 
             } 
             else { 
                 // Se tem nome customizado, mostra ele. Senão "Sala [ID]"
                 String displayName = (custom_room_name != "") ? custom_room_name : ("Sala " + String(config_room_id));
                 showLcd(displayName, "LIVRE"); 
             }
        }
    }
    
    void showLcd(String l1, String l2) { lcd.clear(); lcd.setCursor(0, 0); lcd.print(sanitizeText(l1).substring(0, 16)); lcd.setCursor(0, 1); lcd.print(sanitizeText(l2).substring(0, 16)); }
    void blinkLed(int pin) { digitalWrite(PIN_LED_G, LOW); digitalWrite(PIN_LED_R, LOW); digitalWrite(PIN_LED_Y, LOW); for(int i=0; i<3; i++) { digitalWrite(pin, HIGH); delay(100); digitalWrite(pin, LOW); delay(100); } }
    void setLeds() { digitalWrite(PIN_LED_G, LOW); digitalWrite(PIN_LED_R, LOW); digitalWrite(PIN_LED_W, LOW); if (!rfidWasMissing && WiFi.status() == WL_CONNECTED && mqtt.connected()) { digitalWrite(PIN_LED_Y, LOW); } else if (!pendingExitSync) { digitalWrite(PIN_LED_Y, HIGH); } if (currentMode == REGISTRATION) digitalWrite(PIN_LED_W, HIGH); else { prefs_room.begin("room", true); bool occupied = prefs_room.isKey("uid"); prefs_room.end(); if (pendingExitSync) digitalWrite(PIN_LED_G, HIGH); else digitalWrite(occupied ? PIN_LED_R : PIN_LED_G, HIGH); } }
    void formatUid(byte* uid, char* buffer) { sprintf(buffer, "%02X%02X%02X%02X", uid[0], uid[1], uid[2], uid[3]); }
    void getIsoTime(char* buffer) { struct tm timeinfo; if(!getLocalTime(&timeinfo)) strcpy(buffer, "1970-01-01T00:00:00Z"); else strftime(buffer, 35, "%Y-%m-%dT%H:%M:%S-03:00", &timeinfo); }
    void handleSerial(char cmd) { if (cmd == 'C') { currentMode = REGISTRATION; updateUI(); } if (cmd == 'R') { resetLocalState(); } }
};

AccessControl* AccessControl::instance = nullptr;
AccessControl sys;
void setup() { sys.init(); }
void loop() { sys.loop(); }