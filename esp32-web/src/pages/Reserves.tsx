import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';

import { NavMenu } from '@components/NavMenu.tsx';

import { useSession } from '@hooks/useSession.ts';

import { formatDateTime } from '@utils/formatDateTime.ts';

import {
  createReserve,
  deleteReserva,
  listClassrooms,
  listReserves,
  listTeachers,
} from '../services/api.ts';
import type { Classroom, Reserve, Teacher } from '../types/index.ts';

export function Reserves() {
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateReserveModal, setShowCreateReserveModal] = useState(false);
  const [createReserveError, setCreateReserveError] = useState<string | null>(
    null,
  );

  const { user } = useSession();

  const loadClassroomsToSelect = useCallback(async () => {
    try {
      const response = await listClassrooms();
      setClassrooms(response.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadTeachersToSelect = useCallback(async () => {
    try {
      const response = await listTeachers();
      setTeachers(response.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadReserves = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listReserves();
      setReserves(response.data);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchData = () => {
      loadReserves();
      loadClassroomsToSelect();
      loadTeachersToSelect();
    };
    fetchData();
  }, [loadReserves, loadTeachersToSelect, loadClassroomsToSelect]);

  const handleCreateReserve = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setCreateReserveError(null);

    const form = event.currentTarget;
    const classroomIdInput = form.elements.namedItem(
      'classroomId',
    ) as HTMLSelectElement;
    const teacherIdInput = form.elements.namedItem(
      'teacherId',
    ) as HTMLSelectElement;
    const entryDatetimeInput = form.elements.namedItem(
      'entryDateTime',
    ) as HTMLInputElement;
    const exitDatetimeInput = form.elements.namedItem(
      'exitDateTime',
    ) as HTMLInputElement;

    const body = {
      classroom_id: Number(classroomIdInput.value),
      teacher_id: Number(teacherIdInput.value),
      entry_datetime: entryDatetimeInput.value,
      exit_datetime: exitDatetimeInput.value,
    };

    try {
      await createReserve(body);
      form.reset();
      setShowCreateReserveModal(false);
      loadReserves();
    } catch (err: any) {
      setCreateReserveError(err.message);
    }
  };

  const handleDeleteReserve = async (reservaId: number) => {
    if (!window.confirm('Deseja realmente deletar esta reserva?')) {
      return;
    }

    try {
      await deleteReserva(reservaId);
      loadReserves();
    } catch (err: any) {
      console.log(error);
      alert(err.message);
    }
  };

  const handleCloseModal = () => {
    setCreateReserveError(null);
    setShowCreateReserveModal(false);
  };

  return (
    <>
      <NavMenu />
      <Container className="pt-5">
        <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
          <h2 className="mb-0">Reservas</h2>
          <Button
            variant="success"
            onClick={() => {
              setCreateReserveError(null);
              setShowCreateReserveModal(true);
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
                    <th>Nome do Professor</th>
                    <th>Nome da Sala</th>
                    <th>Data e horário de entrada</th>
                    <th>Data e horário de saída</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {reserves.length === 0 && !loading && !error ? (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Nenhuma reserva encontrada.
                      </td>
                    </tr>
                  ) : (
                    reserves.map((reserve) => (
                      <tr key={reserve.id}>
                        <td>{reserve.teacher?.name || ''}</td>
                        <td>{reserve.classroom?.name || ''}</td>
                        <td>{formatDateTime(reserve.entry_datetime)}</td>
                        <td>{formatDateTime(reserve.exit_datetime)}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteReserve(reserve.id)}
                          >
                            Deletar
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

      <Modal show={showCreateReserveModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title id="reservaModalLabel">Criar Reserva</Modal.Title>
        </Modal.Header>
        <Form id="formAddReserva" onSubmit={handleCreateReserve}>
          <Modal.Body>
            {createReserveError && (
              <Alert variant="danger">{createReserveError}</Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label htmlFor="reservaProfSelect">Professor</Form.Label>
              <Form.Select
                id="reservaProfSelect"
                name="teacherId"
                required
                disabled={!user?.is_admin}
                // defaultValue={
                //   !user?.is_admin && currentTeacherId ? currentTeacherId : ''
                // }
              >
                <option value={user?.id}>
                  {user?.is_admin ? 'Selecione um Professor' : user?.name}
                </option>
                {teachers.length === 0 ? (
                  <option disabled>Carregando professores...</option>
                ) : (
                  teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}{' '}
                      {!user?.is_admin && teacher.id === user?.id
                        ? '(Você)'
                        : ''}
                    </option>
                  ))
                )}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label htmlFor="reservaRoomSelect">Sala</Form.Label>
              <Form.Select id="reservaRoomSelect" name="classroomId" required>
                <option value="">Selecione a Sala</option>
                {classrooms.length === 0 ? (
                  <option disabled>Carregando salas...</option>
                ) : (
                  classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))
                )}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label htmlFor="reservaEntryDatetime">
                  Data e horário da entrada
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  id="reservaEntryDatetime"
                  name="entryDateTime"
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label htmlFor="reservaExitDatetime">
                  Data e horário da saída
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  id="reservaExitDatetime"
                  name="exitDateTime"
                  required
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Fechar
            </Button>
            <Button type="submit" variant="primary">
              Criar Reserva
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
