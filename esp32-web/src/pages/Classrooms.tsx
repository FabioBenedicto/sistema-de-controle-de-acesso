import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Container,
  Form,
  Modal,
  Spinner,
  Table,
} from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';

import { NavMenu } from '@components/NavMenu.tsx';

import { formatDateTime } from '@utils/formatDateTime.ts';

import {
  activateCreationMode,
  createClassroom,
  deleteClassroom,
  forceFree,
  listClassrooms,
  listRegisters,
} from '../services/api.ts';
import type { Classroom, Register } from '../types/index.ts';

export function Classrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateClassroomModal, setShowCreateClassroomModal] =
    useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [showListRegistersModal, setShowListRegistersModal] = useState(false);
  const [registers, setRegisters] = useState<Register[]>([]);
  const [registersLoading, setRegistersLoading] = useState(false);
  const [registersError, setRegistersError] = useState<string | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
    null,
  );

  const loadClassrooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listClassrooms();
      setClassrooms(response.data);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadClassrooms();
    };

    fetchData();
  }, [loadClassrooms]);

  const handleCreateClassroom = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setCreateError(null);

    const form = event.currentTarget;
    const nameInput = form.elements.namedItem(
      'classroomName',
    ) as HTMLInputElement;

    const body = {
      name: nameInput.value,
    };

    try {
      await createClassroom(body);
      form.reset();
      setShowCreateClassroomModal(false);
      await loadClassrooms();
    } catch (err: any) {
      setCreateError(err.message);
    }
  };

  const handleDeleteClassroom = async (
    classroomId: number,
    classroomName: string,
  ) => {
    if (
      !window.confirm(`Deseja realmente deletar a sala "${classroomName}"?`)
    ) {
      return;
    }

    try {
      await deleteClassroom(classroomId);
      await loadClassrooms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleListClassroomRegisters = async (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setRegisters([]);
    setRegistersError(null);
    setRegistersLoading(true);
    setShowListRegistersModal(true);

    try {
      const response = await listRegisters({ classroomId: classroom.id });
      setRegisters(response.data);
    } catch (err: any) {
      setRegistersError(err.message);
    }

    setRegistersLoading(false);
  };

  const handleActivateCreationMode = async (id: number) => {
    try {
      await activateCreationMode(id);
    } catch {
      alert('Não foi possível ativar o modo de cadastro');
    }
  };

  const handleForceFree = async (id: number) => {
    try {
      await forceFree(id);
    } catch {
      alert('Não foi possível ativar forçar a liberação da sala');
    }
  };

  return (
    <>
      <NavMenu />

      <Container className="pt-5">
        <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
          <h2 className="mb-0">Salas</h2>
          <Button
            variant="success"
            onClick={() => {
              setShowCreateClassroomModal(true);
              setCreateError(null);
            }}
          >
            <FaPlus size={10} color="white" />
          </Button>
        </div>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        )}
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Ações</th>
                    <th>Ações no ESP32</th>
                  </tr>
                </thead>
                <tbody>
                  {!classrooms.length && !loading && !error ? (
                    <tr>
                      <td colSpan={3} className="text-center">
                        Nenhuma sala encontrada.
                      </td>
                    </tr>
                  ) : (
                    classrooms.map((classroom) => (
                      <tr key={classroom.id}>
                        <td>{classroom.name}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              handleListClassroomRegisters(classroom)
                            }
                          >
                            Registros
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              handleDeleteClassroom(
                                classroom.id,
                                classroom.name,
                              )
                            }
                          >
                            Deletar
                          </Button>
                        </td>
                        <td>
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              handleActivateCreationMode(classroom.id)
                            }
                          >
                            Ativar modo de cadastro
                          </Button>
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleForceFree(classroom.id)}
                          >
                            Forçar liberação
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </Container>

      <Modal
        show={showCreateClassroomModal}
        onHide={() => setShowCreateClassroomModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Criar Sala</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateClassroom}>
          <Modal.Body>
            {createError && <Alert variant="danger">{createError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label htmlFor="classroomName">Nome da Sala</Form.Label>
              <Form.Control
                type="text"
                id="classroomName"
                name="classroomName"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCreateClassroomModal(false)}
            >
              Fechar
            </Button>
            <Button type="submit" variant="primary">
              Criar Sala
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showListRegistersModal}
        onHide={() => setShowListRegistersModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Registros: {selectedClassroom?.name || ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {registersLoading && (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          )}
          {registersError && <Alert variant="danger">{registersError}</Alert>}

          {!registersLoading && !registersError && (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Nome da Sala</th>
                    <th>Nome do Professor</th>
                    <th>Data de entrada</th>
                    <th>Data de saída</th>
                  </tr>
                </thead>
                <tbody>
                  {registers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">
                        Nenhum registro encontrado para esta sala.
                      </td>
                    </tr>
                  ) : (
                    registers.map((register, index) => (
                      <tr key={index}>
                        <td>{register.classroom?.name || ''}</td>
                        <td>{register.teacher?.name || ''}</td>
                        <td>{formatDateTime(register.entry_datetime)}</td>
                        <td>
                          {register.exit_datetime
                            ? formatDateTime(register.exit_datetime)
                            : ''}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowListRegistersModal(false)}
          >
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
