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
  Select,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, SearchIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

// Componente del formulario para crear/editar profesor
function ProfesorForm({ profesor, onClose, onSave }) {
  const [nombre, setNombre] = useState(profesor?.nombre || '');
  const [apellidos, setApellidos] = useState(profesor?.apellidos || '');
  const [clavepe, setClavepe] = useState(profesor?.clavepe || '');
  const [genero, setGenero] = useState(profesor?.genero || 'M');
  const [activo, setActivo] = useState(profesor?.activo || true);
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      const data = { 
        nombre, 
        apellidos, 
        clavepe, 
        genero, 
        activo 
      };
      
      if (profesor?.id) {
        await axios.put(`${config.API.PROFESOR}/${profesor.id}`, data);
        toast({
          title: 'Profesor actualizado.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(config.API.PROFESOR, data);
        toast({
          title: 'Profesor creado.',
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
        description: error.response?.data?.message || 'Hubo un error al guardar el profesor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <FormControl mb={4} isRequired>
        <FormLabel>Nombre</FormLabel>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </FormControl>

      <FormControl mb={4} isRequired>
        <FormLabel>Apellidos</FormLabel>
        <Input value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
      </FormControl>

      <FormControl mb={4} isRequired>
        <FormLabel>Clave PE</FormLabel>
        <Input value={clavepe} onChange={(e) => setClavepe(e.target.value)} />
      </FormControl>

      <FormControl mb={4} isRequired>
        <FormLabel>Género</FormLabel>
        <Select value={genero} onChange={(e) => setGenero(e.target.value)}>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
          <option value="O">Otro</option>
        </Select>
      </FormControl>

      <FormControl display="flex" alignItems="center" mb={4}>
        <FormLabel htmlFor="activo-switch" mb="0">
          Activo
        </FormLabel>
        <Switch 
          id="activo-switch" 
          isChecked={activo} 
          onChange={(e) => setActivo(e.target.checked)} 
        />
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

// Vista principal de Profesores
export default function ProfesoresPage() {
  const [profesores, setProfesores] = useState([]);
  const [filteredProfesores, setFilteredProfesores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [selectedProfesor, setSelectedProfesor] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchProfesores = async () => {
    try {
      const { data } = await axios.get(`${config.API.PROFESOR}?soloactivo=${activeOnly}`);
      setProfesores(data);
      setFilteredProfesores(data);
    } catch (error) {
      toast({
        title: 'Error al cargar los profesores.',
        description: 'No se pudieron obtener los datos del servidor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchProfesores();
  }, [activeOnly]);

  useEffect(() => {
    const results = profesores.filter(
      (profesor) =>
        profesor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profesor.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profesor.clavepe.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProfesores(results);
  }, [searchTerm, profesores]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${config.API.PROFESOR}/${id}`);
      toast({
        title: 'Profesor eliminado.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchProfesores();
    } catch (error) {
      toast({
        title: 'Error al eliminar.',
        description: 'No se pudo eliminar el profesor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (profesor) => {
    setSelectedProfesor(profesor);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedProfesor(null);
    onOpen();
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="xl" color="gray.700">
          Gestión de Profesores
        </Heading>
        <Tooltip label="Añadir nuevo profesor" placement="left">
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
            placeholder="Buscar por nombre, apellidos o clave PE..."
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
                <Th>Nombre</Th>
                <Th>Apellidos</Th>
                <Th>Clave PE</Th>
                <Th>Género</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProfesores.map((profesor) => (
                <Tr key={profesor.id}>
                  <Td>{profesor.id}</Td>
                  <Td>{profesor.nombre}</Td>
                  <Td>{profesor.apellidos}</Td>
                  <Td>{profesor.clavepe}</Td>
                  <Td>
                    {profesor.genero === 'M' ? 'Masculino' : 
                     profesor.genero === 'F' ? 'Femenino' : 'Otro'}
                  </Td>
                  <Td>{profesor.activo ? 'Activo' : 'Inactivo'}</Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="yellow"
                        onClick={() => handleEdit(profesor)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(profesor.id)}
                      />
                    </Flex>
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
            {selectedProfesor ? 'Editar Profesor' : 'Nuevo Profesor'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ProfesorForm
              profesor={selectedProfesor}
              onClose={onClose}
              onSave={fetchProfesores}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}