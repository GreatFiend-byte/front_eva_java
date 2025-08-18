import { Box, Flex, Spacer, Menu, MenuButton, MenuList, MenuItem, Button, Avatar } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <Box bg="gray.100" px={4} py={2} boxShadow="sm">
      <Flex align="center">
        <Box fontWeight="bold" fontSize="xl">
          Sistema Académico
        </Box>
        
        {isAuthenticated() && (
          <Flex ml={10} gap={4}>
            <Button as={Link} to="/divisiones" variant="ghost">
              Divisiones
            </Button>
            <Button as={Link} to="/profesores" variant="ghost">
              Profesores
            </Button>
            <Button as={Link} to="/categorias" variant="ghost">
              Categorías
            </Button>
          </Flex>
        )}
        
        <Spacer />
        
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {isAuthenticated() ? (
              <>
                <Avatar size="sm" mr={2} name={user?.email} />
                {user?.email}
              </>
            ) : (
              "Usuario"
            )}
          </MenuButton>
          <MenuList>
            {isAuthenticated() ? (
              <MenuItem onClick={logout}>Cerrar sesión</MenuItem>
            ) : (
              <MenuItem as={Link} to="/login">
                Iniciar sesión
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
}