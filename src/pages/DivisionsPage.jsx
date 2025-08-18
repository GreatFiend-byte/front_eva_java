// src/pages/DivisionsPage.jsx
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Switch,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, SearchIcon, EditIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

// Componente del formulario para crear/editar (sin cambios)
function DivisionForm({ division, onClose, onSave }) {
  const [clave, setClave] = useState(division?.clave || '');
  const [nombre, setNombre] = useState(division?.nombre || '');
  const [activo, setActivo] = useState(division?.activo || false);
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      const data = { clave, nombre, activo };
      if (division?.id) {
        await axios.put(`${config.API.DIVISION}/${division.id}`, data);
        toast({
          title: 'División actualizada.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(config.API.DIVISION, data);
        toast({
          title: 'División creada.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onSave();
      onClose();
    } catch (error) {
      toast({
        title: 'Error.',
        description: 'Hubo un error al guardar la división.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <FormControl mb={4} isRequired>
        <FormLabel>Clave</FormLabel>
        <Input value={clave} onChange={(e) => setClave(e.target.value)} />
      </FormControl>
      <FormControl mb={4} isRequired>
        <FormLabel>Nombre</FormLabel>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </FormControl>
      <FormControl display="flex" alignItems="center" mb={4}>
        <FormLabel htmlFor="activo-switch" mb="0">
          Activo
        </FormLabel>
        <Switch id="activo-switch" isChecked={activo} onChange={(e) => setActivo(e.target.checked)} />
      </FormControl>
      <Flex justifyContent="flex-end">
        <Button colorScheme="red" mr={3} onClick={onClose}>
          Cancelar
        </Button>
        <Button colorScheme="blue" type="submit">
          Guardar
        </Button>
      </Flex>
    </Box>
  );
}

// Vista principal de Divisiones (con cambios)
export default function DivisionsPage() {
  const [divisions, setDivisions] = useState([]);
  const [filteredDivisions, setFilteredDivisions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchDivisions = async () => {
    try {
      const { data } = await axios.get(`${config.API.DIVISION}?soloActivos=${activeOnly}`);
      setDivisions(data);
      setFilteredDivisions(data);
    } catch (error) {
      toast({
        title: 'Error al cargar las divisiones.',
        description: 'No se pudieron obtener los datos del servidor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, [activeOnly]);

  useEffect(() => {
    const results = divisions.filter(
      (division) =>
        division.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
        division.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDivisions(results);
  }, [searchTerm, divisions]);

  const handleDelete = async (id) => {
    try {
      await axios.post(config.API.DIVISION, data);
      toast({
        title: 'División eliminada.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchDivisions();
    } catch (error) {
      toast({
        title: 'Error al eliminar.',
        description: 'No se pudo eliminar la división.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (division) => {
    setSelectedDivision(division);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedDivision(null);
    onOpen();
  };

  // Función para navegar a la página de programas educativos
  const handleNavigateToPrograms = (divisionId) => {
    navigate(`/programas/${divisionId}`);
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="xl" color="gray.700">
          Gestión de Divisiones
        </Heading>
        <Tooltip label="Añadir nueva división" placement="left">
          <IconButton
            colorScheme="blue"
            icon={<AddIcon />}
            size="lg"
            isRound
            onClick={handleCreate}
          />
        </Tooltip>
      </Flex>

      <Flex mb={4} gap={4}>
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por clave o nombre..."
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="white"
            borderRadius="lg"
          />
        </InputGroup>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="active-filter" mb="0" whiteSpace="nowrap">
            Mostrar solo activos
          </FormLabel>
          <Switch
            id="active-filter"
            isChecked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
        </FormControl>
      </Flex>

      <Box
        bg="white"
        p={6}
        borderRadius="xl"
        boxShadow="lg"
        overflowX="auto"
      >
        <TableContainer>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Clave</Th>
                <Th>Nombre</Th>
                <Th>Activo</Th>
                <Th>Acciones</Th>
                <Th>Programas</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredDivisions.map((division) => (
                <Tr key={division.id}>
                  <Td>{division.id}</Td>
                  <Td>{division.clave}</Td>
                  <Td>{division.nombre}</Td>
                  <Td>{division.activo ? 'Sí' : 'No'}</Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="yellow"
                        onClick={() => handleEdit(division)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(division.id)}
                      />
                    </Flex>
                  </Td>
                  <Td>
                    <Tooltip label="Ver programas educativos" placement="right">
                      <IconButton
                        icon={<ExternalLinkIcon />}
                        size="sm"
                        colorScheme="teal"
                        onClick={() => handleNavigateToPrograms(division.id)}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedDivision ? 'Editar División' : 'Nueva División'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <DivisionForm
              division={selectedDivision}
              onClose={onClose}
              onSave={fetchDivisions}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}