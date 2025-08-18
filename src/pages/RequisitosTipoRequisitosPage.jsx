import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Button, Flex, useToast, Badge, Text, Input, InputGroup,
  InputLeftElement, IconButton, Tooltip, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Select 
} from '@chakra-ui/react';
import { ChevronLeftIcon, AddIcon, SearchIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { config } from '../config';

function RequisitoForm({ requisito, onClose, onSave, tiposRequisitos }) {
  const [nombre, setNombre] = useState(requisito?.nombre || '');
  const [tipoRequisitoId, setTipoRequisitoId] = useState(requisito?.tipoRequisito?.id || '');
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      const data = { 
        nombre, 
        tipoRequisito: { id: parseInt(tipoRequisitoId) } 
      };
      
      if (requisito?.id) {
        await axios.put(`${config.API.REQUISITOS}/${requisito.id}`, data);
        toast({
          title: 'Requisito actualizado.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(config.API.REQUISITOS, data);
        toast({
          title: 'Requisito creado.',
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
        description: error.response?.data?.message || 'Hubo un error al guardar el requisito.',
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
        <Input 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          placeholder="Ingrese el nombre del requisito"
        />
      </FormControl>
      
      <FormControl mb={4} isRequired>
        <FormLabel>Tipo de Requisito</FormLabel>
        <Select
          placeholder="Seleccione un tipo"
          value={tipoRequisitoId}
          onChange={(e) => setTipoRequisitoId(e.target.value)}
        >
          {tiposRequisitos.map(tipo => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </Select>
      </FormControl>
      
      <Flex justifyContent="flex-end">
        <Button colorScheme="red" mr={3} onClick={onClose}>
          Cancelar
        </Button>
        <Button colorScheme="blue" type="submit">
          {requisito?.id ? 'Actualizar' : 'Crear'}
        </Button>
      </Flex>
    </Box>
  );
}

export default function RequisitosTipoRequisitosPage() {
  const { id, tipoRequisitoId } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [tipoRequisito, setTipoRequisito] = useState(null);
  const [requisitos, setRequisitos] = useState([]);
  const [filteredRequisitos, setFilteredRequisitos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequisito, setSelectedRequisito] = useState(null);
  const [tiposRequisitos, setTiposRequisitos] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cargarDatos = async () => {
    try {
      // Cargar datos de la categoría
      const catResponse = await axios.get(`${config.API.CATEGORIAS}/${id}`);
      setCategoria(catResponse.data);
      
      // Cargar tipo de requisito
      const tipoReqResponse = await axios.get(`${config.API.TIPOS_REQUISITOS}/${tipoRequisitoId}`);
      setTipoRequisito(tipoReqResponse.data);
      
      // Cargar requisitos
      const reqResponse = await axios.get(config.API.REQUISITOS);
      const requisitosFiltrados = reqResponse.data.filter(
        req => req.tipoRequisito?.id == tipoRequisitoId
      );
      setRequisitos(requisitosFiltrados);
      setFilteredRequisitos(requisitosFiltrados);
      
      // Cargar tipos de requisitos para el formulario
      const tiposReqResponse = await axios.get(config.API.TIPOS_REQUISITOS);
      setTiposRequisitos(tiposReqResponse.data);
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
  }, [id, tipoRequisitoId]);

  useEffect(() => {
    const results = requisitos.filter(
      req => req.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequisitos(results);
  }, [searchTerm, requisitos]);

  const handleDelete = async (reqId) => {
    if (window.confirm('¿Estás seguro de eliminar este requisito?')) {
      try {
        await axios.delete(`${config.API.REQUISITOS}/${reqId}`);
        toast({
          title: 'Requisito eliminado.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        cargarDatos();
      } catch (error) {
        toast({
          title: 'Error al eliminar.',
          description: 'No se pudo eliminar el requisito.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleEdit = (requisito) => {
    setSelectedRequisito(requisito);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedRequisito(null);
    onOpen();
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Flex alignItems="center" mb={6}>
        <Button
          leftIcon={<ChevronLeftIcon />}
          variant="outline"
          mr={4}
          onClick={() => navigate(`/categorias/${id}/requisitos`)}
        >
          Volver
        </Button>
        <Heading as="h1" size="xl" color="gray.700">
          Requisitos: {tipoRequisito?.nombre || 'Cargando...'} (Categoría: {categoria?.nombre || 'Cargando...'})
        </Heading>
      </Flex>

      <Flex mb={4} gap={4}>
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Buscar requisitos..."
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="white"
            borderRadius="lg"
          />
        </InputGroup>
        <Tooltip label="Añadir nuevo requisito" placement="left">
          <IconButton
            colorScheme="blue"
            icon={<AddIcon />}
            size="lg"
            isRound
            onClick={handleCreate}
          />
        </Tooltip>
      </Flex>

      <Box bg="white" p={6} borderRadius="xl" boxShadow="lg" overflowX="auto">
        <TableContainer>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Nombre</Th>
                <Th>Tipo de Requisito</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRequisitos.map((requisito) => (
                <Tr key={requisito.id}>
                  <Td>{requisito.id}</Td>
                  <Td>{requisito.nombre}</Td>
                  <Td>{requisito.tipoRequisito?.nombre || 'Sin tipo'}</Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="yellow"
                        onClick={() => handleEdit(requisito)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(requisito.id)}
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
            {selectedRequisito ? 'Editar Requisito' : 'Nuevo Requisito'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RequisitoForm
              requisito={selectedRequisito}
              onClose={onClose}
              onSave={cargarDatos}
              tiposRequisitos={tiposRequisitos}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}