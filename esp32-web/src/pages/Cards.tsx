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

import { NavMenu } from '@components/NavMenu.tsx';

import { formatDateTime } from '@utils/formatDateTime';

import {
  assignTeacher,
  deleteCard,
  listCards,
  listTeachers,
} from '@services/api';

import type { Card, Teacher } from '../types';

export function Cards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [assignTeacherError, setAssignTeacherError] = useState<string | null>(
    null,
  );
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    null,
  );

  const loadProfessoresToSelect = useCallback(async () => {
    try {
      const response = await listTeachers();
      setTeachers(response.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listCards();
      setCards(response.data);
    } catch (err) {
      setError((err as Error).message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      loadCards();
      loadProfessoresToSelect();
    };

    fetchData();
  }, [loadCards, loadProfessoresToSelect]);

  const resetCardModal = () => {
    setSelectedCard(null);
    setSelectedTeacherId(null);
    setAssignTeacherError(null);
    setShowAssignTeacherModal(false);
  };

  const handleAssignTeacher = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setAssignTeacherError(null);

    const cardId = selectedCard?.id;
    const teacherId = selectedTeacherId;

    if (!cardId || !teacherId) {
      setAssignTeacherError('Selecione um cartão e um professor válido');
      return;
    }

    try {
      await assignTeacher(Number(cardId), Number(teacherId));
      resetCardModal();
      loadCards();
    } catch (err: any) {
      setAssignTeacherError(err.message);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!window.confirm('Deseja realmente deletar este cartão?')) return;

    try {
      await deleteCard(cardId);
      loadCards();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <NavMenu />
      <Container className="pt-5">
        <h2 className="mt-4 mb-3">Cartões</h2>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        )}
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <Table striped hover id="cardsTable">
                <thead>
                  <tr>
                    <th>UID do Cartão</th>
                    <th>Criado em</th>
                    <th>Nome do professor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.length === 0 && !loading && !error ? (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Nenhum cartão encontrado.
                      </td>
                    </tr>
                  ) : (
                    cards.map((card) => (
                      <tr key={card.id}>
                        <td>{card.uid}</td>
                        <td>{formatDateTime(card.created_at)}</td>
                        <td>{card.teacher?.name || ''}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            className="me-2"
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            Deletar
                          </Button>

                          {!card.teacher && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => {
                                setSelectedCard(card);
                                setAssignTeacherError(null);
                                setShowAssignTeacherModal(true);
                              }}
                            >
                              Atribuir Professor
                            </Button>
                          )}
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

      <Modal show={showAssignTeacherModal} onHide={resetCardModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            Atribuir Professor: {selectedCard?.uid || ''}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAssignTeacher}>
          <Modal.Body>
            {assignTeacherError && (
              <Alert variant="danger">{assignTeacherError}</Alert>
            )}

            <Form.Control
              type="hidden"
              id="cardId"
              value={selectedCard?.id || ''}
            />

            <Form.Group className="mb-3">
              <Form.Label htmlFor="profSelect">Selecionar Professor</Form.Label>
              <Form.Select
                id="profSelect"
                required
                onChange={(e) => setSelectedTeacherId(Number(e.target.value))}
              >
                <option value="">Selecione um Professor</option>
                {teachers.length === 0 ? (
                  <option disabled>Carregando professores...</option>
                ) : (
                  teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))
                )}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={resetCardModal}>
              Fechar
            </Button>
            <Button type="submit" variant="primary" id="btnSubmitCard">
              Atribuir Professor
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
