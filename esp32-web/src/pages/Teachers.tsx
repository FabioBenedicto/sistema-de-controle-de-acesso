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

import { NavMenu } from '@components/NavMenu';

import { formatDateTime } from '@utils/formatDateTime';

import {
  createTeacher,
  deleteTeacher,
  listRegisters,
  listTeachers,
} from '../services/api';
import type { Register, Teacher } from '../types';

export function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateTeacherModal, setShowCreateTeacherModal] = useState(false);
  const [createTeacherError, setCreateTeacherError] = useState<string | null>(
    null,
  );

  const [showListRegisterModal, setShowListRegistersModal] = useState(false);
  const [registers, setRegisters] = useState<Register[]>([]);
  const [isRegistersLoading, setIsRegistersLoading] = useState(false);
  const [listRegistersError, setListRegistersError] = useState<string | null>(
    null,
  );
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listTeachers();
      setTeachers(response.data);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadTeachers();
    };

    fetchData();
  }, [loadTeachers]);

  const handleCreateTeacher = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setCreateTeacherError(null);

    const form = event.currentTarget;
    const nameInput = form.elements.namedItem(
      'teacherName',
    ) as HTMLInputElement;
    const protocolInput = form.elements.namedItem(
      'teacherProtocol',
    ) as HTMLInputElement;
    const passwordInput = form.elements.namedItem(
      'teacherPassword',
    ) as HTMLInputElement;

    const body = {
      name: nameInput.value,
      protocol: protocolInput.value,
      password: passwordInput.value,
      is_admin: false,
    };

    try {
      await createTeacher(body);
      form.reset();
      setShowCreateTeacherModal(false);
      await loadTeachers();
    } catch (err: any) {
      setCreateTeacherError(err.message);
    }
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (
      !window.confirm(`Deseja realmente deletar o professor ${teacher.name}?`)
    ) {
      return;
    }

    try {
      await deleteTeacher(teacher.id);
      await loadTeachers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleListTeacherRegisters = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setRegisters([]);
    setListRegistersError(null);
    setIsRegistersLoading(true);
    setShowListRegistersModal(true);

    try {
      const response = await listRegisters({ teacherId: teacher.id });
      setRegisters(response.data);
    } catch (err) {
      setListRegistersError((err as Error).message);
    }

    setIsRegistersLoading(false);
  };

  return (
    <>
      <NavMenu />

      <Container className="pt-5">
        <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
          <h2 className="mb-0">Professores</h2>
          <Button
            variant="success"
            onClick={() => {
              setShowCreateTeacherModal(true);
              setCreateTeacherError(null);
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
                    <th>Protocolo</th>
                    <th>Senha</th>
                    <th>Nome</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {!teachers.length && !loading && !error ? (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Nenhum professor cadastrado.
                      </td>
                    </tr>
                  ) : (
                    teachers.map((teacher) => (
                      <tr key={teacher.id}>
                        <td>{teacher.protocol}</td>
                        <td>{teacher.password}</td>
                        <td>{teacher.name}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleListTeacherRegisters(teacher)}
                          >
                            Registros
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteTeacher(teacher)}
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

      <Modal
        show={showCreateTeacherModal}
        onHide={() => setShowCreateTeacherModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title id="modalLabel">Criar Professor</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateTeacher}>
          <Modal.Body>
            {createTeacherError && (
              <Alert variant="danger">{createTeacherError}</Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label htmlFor="teacherProtocol">Protocolo</Form.Label>
              <Form.Control
                type="text"
                id="teacherProtocol"
                name="teacherProtocol"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="teacherPassword">Senha</Form.Label>
              <Form.Control
                type="password"
                id="teacherPassword"
                name="teacherPassword"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="teacherName">Nome</Form.Label>
              <Form.Control
                type="text"
                id="teacherName"
                name="teacherName"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCreateTeacherModal(false)}
            >
              Fechar
            </Button>
            <Button type="submit" variant="primary">
              Criar Professor
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showListRegisterModal}
        onHide={() => setShowListRegistersModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Registros: {selectedTeacher?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isRegistersLoading && (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          )}
          {listRegistersError && (
            <Alert variant="danger">{listRegistersError}</Alert>
          )}

          {!isRegistersLoading && !listRegistersError && (
            <div className="table-responsive">
              <Table striped>
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
