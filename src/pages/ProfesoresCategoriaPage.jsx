import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Button, Flex, Select, useToast, Badge, Text, Avatar,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, useDisclosure
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { config } from '../config';

export default function ProfesoresCategoriaPage() {
  const { id } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [profesoresAsignados, setProfesoresAsignados] = useState([]);
  const [profesoresDisponibles, setProfesoresDisponibles] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [relacionAEliminar, setRelacionAEliminar] = useState(null);

  const cargarDatos = async () => {
    try {
      // Cargar datos de la categoría
      const catResponse = await axios.get(`${config.API.CATEGORIAS}/${id}`);
      setCategoria(catResponse.data);
      
      // Cargar profesores asignados
      const response = await axios.get(`${config.API.CATEGORIAS}/profesor/${id}`);
      setProfesoresAsignados(response.data);
      
      // Cargar todos los profesores
      const profResponse = await axios.get(`${config.API.PROFESOR}?soloactivo=false`);
      setProfesoresDisponibles(profResponse.data);
    } catch (error) {
      toast({
        title: 'Error al cargar datos.',
        description: 'No se pudieron obtener los datos del servidor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const asignarProfesor = async () => {
    if (!profesorSeleccionado) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un profesor',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(`${config.API.CATEGORIAS}/asignar-profesor/${profesorSeleccionado}`, null, {
        params: { categoriaId: id }
      });
      toast({
        title: 'Profesor asignado.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      cargarDatos();
      setProfesorSeleccionado('');
    } catch (error) {
      toast({
        title: 'Error al asignar profesor.',
        description: error.response?.data?.message || 'No se pudo asignar el profesor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const confirmarDesasignacion = (relacion) => {
    setRelacionAEliminar(relacion);
    onOpen();
  };

  const desasignarProfesor = async () => {
    try {
      await axios.delete(`${config.API.CATEGORIAS}/desasignar-profesor/${relacionAEliminar.id}`);
      toast({
        title: 'Profesor desasignado.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      cargarDatos();
      onClose();
    } catch (error) {
      toast({
        title: 'Error al desasignar profesor.',
        description: 'No se pudo desasignar el profesor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const obtenerNombreProfesor = (profesorId) => {
    const profesor = profesoresDisponibles.find(p => p.id === profesorId);
    return profesor ? `${profesor.nombre}` : 'Nombre no encontrado';
  };

  const obtenerApellidosProfesor = (profesorId) => {
    const profesor = profesoresDisponibles.find(p => p.id === profesorId);
    return profesor ? `${profesor.apellidos}` : 'Apellidos no encontrados';
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Flex alignItems="center" mb={6}>
        <Button
          leftIcon={<ChevronLeftIcon />}
          variant="outline"
          mr={4}
          onClick={() => navigate('/categorias')}
        >
          Volver
        </Button>
        <Heading as="h1" size="xl" color="gray.700">
          Profesores de la categoría: {categoria?.nombre || 'Cargando...'}
        </Heading>
      </Flex>

      <Box bg="white" p={6} borderRadius="xl" boxShadow="lg" mb={6}>
        <Text fontSize="lg" mb={4}>Asignar nuevo profesor</Text>
        <Flex gap={4} alignItems="flex-end">
          <Select
            placeholder="Seleccione un profesor"
            value={profesorSeleccionado}
            onChange={(e) => setProfesorSeleccionado(e.target.value)}
            flex="1"
          >
            {profesoresDisponibles
              .filter(prof => !profesoresAsignados.some(pa => pa.profesorId === prof.id))
              .map(profesor => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.nombre} {profesor.apellidos}
                </option>
              ))}
          </Select>
          <Button colorScheme="blue" onClick={asignarProfesor}>
            Asignar Profesor
          </Button>
        </Flex>
      </Box>

      <Box bg="white" p={6} borderRadius="xl" boxShadow="lg" overflowX="auto">
        <TableContainer>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Apellidos</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {profesoresAsignados.map((relacion) => (
                <Tr key={relacion.id}>
                  <Td>
                    <Flex alignItems="center">
                      <Avatar
                        size="sm"
                        name={obtenerNombreProfesor(relacion.profesorId)}
                        mr={3}
                      />
                      {obtenerNombreProfesor(relacion.profesorId)}
                    </Flex>
                  </Td>
                  <Td>{obtenerApellidosProfesor(relacion.profesorId)}</Td>
                  <Td>
                    <Badge colorScheme={relacion.active ? 'green' : 'red'}>
                      {relacion.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => confirmarDesasignacion(relacion)}
                    >
                      Desasignar
                    </Button>
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
          <ModalHeader>Confirmar desasignación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            ¿Estás seguro que deseas desasignar al profesor {relacionAEliminar ? obtenerNombreProfesor(relacionAEliminar.profesor_id) : ''}?
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={desasignarProfesor}>
              Desasignar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}