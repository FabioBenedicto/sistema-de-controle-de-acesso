import { Container } from 'react-bootstrap';

import { useSession } from '@hooks/useSession';

import { NavMenu } from '../components/NavMenu';

export function Dashboard() {
  const { user } = useSession();

  return (
    <>
      <NavMenu />

      <Container className="pt-5">
        <h2 className="mt-4">Bem-vindo, {user?.name || ''}</h2>

        <p>
          Use a barra de navegação acima para acessar as funcionalidades do
          sistema.
        </p>
      </Container>
    </>
  );
}
