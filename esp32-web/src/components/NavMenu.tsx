import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import { useSession } from '@hooks/useSession';

export function NavMenu() {
  const { user, logout } = useSession();

  const adminLinks = [
    { href: '/salas', label: 'Salas' },
    { href: '/professores', label: 'Professores' },
    { href: '/cartoes', label: 'Cartões' },
  ];

  const userLinks = [{ href: '/reservas', label: 'Reservas' }];

  return (
    <Navbar bg="success" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/dashboard">
          Sistema
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user?.is_admin &&
              adminLinks.map((link) => (
                <Nav.Link key={link.href} as={NavLink} to={link.href}>
                  {link.label}
                </Nav.Link>
              ))}

            {userLinks.map((link) => (
              <Nav.Link key={link.href} as={NavLink} to={link.href}>
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          <Button variant="outline-light" onClick={logout}>
            Sair
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
