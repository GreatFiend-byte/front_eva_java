import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Button, Flex, Select, useToast, Badge, Text, Input,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, useDisclosure
} from '@chakra-ui/react';
import { ChevronLeftIcon, AddIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { config } from '../config';

export default function TiposRequisitosCategoriaPage() {
  const { id } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [tiposRequisitosAsignados, setTiposRequisitosAsignados] = useState([]);
  const [tiposRequisitosDisponibles, setTiposRequisitosDisponibles] = useState([]);
  const [tipoRequisitoSeleccionado, setTipoRequisitoSeleccionado] = useState('');
  const [nuevoTipoNombre, setNuevoTipoNombre] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const { 
    isOpen: isDeleteModalOpen, 
    onOpen: onDeleteModalOpen, 
    onClose: onDeleteModalClose 
  } = useDisclosure();
  const { 
    isOpen: isCreateModalOpen, 
    onOpen: onCreateModalOpen, 
    onClose: onCreateModalClose 
  } = useDisclosure();
  const [relacionAEliminar, setRelacionAEliminar] = useState(null);

  const cargarDatos = async () => {
    try {
      // Cargar datos de la categoría
      const catResponse = await axios.get(`${config.API.CATEGORIAS}/${id}`);
      setCategoria(catResponse.data);
      
      // Cargar tipos de requisitos asignados
      const response = await axios.get(config.API.CATEGORIAS_TIPO_REQUISITOS);
      const asignados = response.data.filter(rel => rel.categoria.id == id);
      setTiposRequisitosAsignados(asignados);
      
      // Cargar todos los tipos de requisitos
      const tiposReqResponse = await axios.get(config.API.TIPOS_REQUISITOS);
      setTiposRequisitosDisponibles(tiposReqResponse.data);
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

  // Función para crear nuevo tipo de requisito
  const crearNuevoTipoRequisito = async () => {
    if (!nuevoTipoNombre.trim()) {
      toast({
        title: 'Error',
        description: 'Debes ingresar un nombre para el tipo de requisito',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(config.API.TIPOS_REQUISITOS, {
        nombre: nuevoTipoNombre
      });
      
      toast({
        title: 'Tipo de requisito creado.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Actualizar la lista de tipos disponibles
      const tiposReqResponse = await axios.get(config.API.TIPOS_REQUISITOS);
      setTiposRequisitosDisponibles(tiposReqResponse.data);
      
      // Seleccionar automáticamente el nuevo tipo creado
      setTipoRequisitoSeleccionado(response.data.id.toString());
      
      // Cerrar modal y limpiar campo
      onCreateModalClose();
      setNuevoTipoNombre('');
    } catch (error) {
      toast({
        title: 'Error al crear tipo de requisito.',
        description: error.response?.data?.message || 'No se pudo crear el tipo de requisito.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const asignarTipoRequisito = async () => {
    if (!tipoRequisitoSeleccionado) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un tipo de requisito',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(config.API.CATEGORIAS_TIPO_REQUISITOS, {
        categoria: { id: parseInt(id) },
        tipoRequisito: { id: parseInt(tipoRequisitoSeleccionado) }
      });
      toast({
        title: 'Tipo de requisito asignado.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      cargarDatos();
      setTipoRequisitoSeleccionado('');
    } catch (error) {
      toast({
        title: 'Error al asignar tipo de requisito.',
        description: error.response?.data?.message || 'No se pudo asignar el tipo de requisito.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const confirmarEliminacion = (relacion) => {
    setRelacionAEliminar(relacion);
    onDeleteModalOpen();
  };

  const eliminarAsignacion = async () => {
    try {
      await axios.delete(
        `${config.API.CATEGORIAS_TIPO_REQUISITOS}/${relacionAEliminar.categoria.id}/${relacionAEliminar.tipoRequisito.id}`
      );
      toast({
        title: 'Asignación eliminada.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      cargarDatos();
      onDeleteModalClose();
    } catch (error) {
      toast({
        title: 'Error al eliminar asignación.',
        description: error.response?.data?.message || 'No se pudo eliminar la asignación.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleNavigateToRequisitos = (tipoRequisitoId) => {
    navigate(`/categorias/${id}/requisitos/${tipoRequisitoId}`);
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
          Tipos de requisitos para: {categoria?.nombre || 'Cargando...'}
        </Heading>
      </Flex>

      <Box bg="white" p={6} borderRadius="xl" boxShadow="lg" mb={6}>
        <Text fontSize="lg" mb={4}>Asignar tipo de requisito</Text>
        <Flex gap={4} alignItems="flex-end">
          <Select
            placeholder="Seleccione un tipo de requisito"
            value={tipoRequisitoSeleccionado}
            onChange={(e) => setTipoRequisitoSeleccionado(e.target.value)}
            flex="1"
          >
            {tiposRequisitosDisponibles
              .filter(tipoReq => !tiposRequisitosAsignados.some(tr => tr.tipoRequisito.id === tipoReq.id))
              .map(tipoReq => (
                <option key={tipoReq.id} value={tipoReq.id}>
                  {tipoReq.nombre}
                </option>
              ))}
          </Select>
          <Button colorScheme="blue" onClick={asignarTipoRequisito} leftIcon={<AddIcon />}>
            Asignar
          </Button>
          <Button colorScheme="green" onClick={onCreateModalOpen} ml={2}>
            Nuevo Tipo
          </Button>
        </Flex>
      </Box>

      <Box bg="white" p={6} borderRadius="xl" boxShadow="lg" overflowX="auto">
        <TableContainer>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>Tipo de Requisito</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tiposRequisitosAsignados.map((relacion) => (
                <Tr key={`${relacion.categoria.id}-${relacion.tipoRequisito.id}`}>
                  <Td>
                    <Flex alignItems="center" justifyContent="space-between">
                      <Text>{relacion.tipoRequisito.nombre}</Text>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="teal"
                        onClick={() => handleNavigateToRequisitos(relacion.tipoRequisito.id)}
                      >
                        Ver Requisitos
                      </Button>
                    </Flex>
                  </Td>
                  <Td>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => confirmarEliminacion(relacion)}
                    >
                      Eliminar
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* Modal para confirmar eliminación */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar eliminación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            ¿Estás seguro que deseas eliminar la asignación del tipo de requisito {relacionAEliminar?.tipoRequisito?.nombre || ''}?
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteModalClose}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={eliminarAsignacion}>
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para crear nuevo tipo de requisito */}
      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear nuevo tipo de requisito</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box mb={4}>
              <Text mb={2}>Nombre del nuevo tipo de requisito:</Text>
              <Input
                value={nuevoTipoNombre}
                onChange={(e) => setNuevoTipoNombre(e.target.value)}
                placeholder="Ej: Documentación, Certificación, etc."
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateModalClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={crearNuevoTipoRequisito}>
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}