import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Button, Flex, Input, InputGroup, InputLeftElement, IconButton,
  Tooltip, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, FormControl,
  FormLabel, Switch, useToast, useDisclosure, Badge
} from '@chakra-ui/react';
import { AddIcon, SearchIcon, EditIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

function CategoriaForm({ categoria, onClose, onSave }) {
  const [nombre, setNombre] = useState(categoria?.nombre || '');
  const [categoriaEstatal, setCategoriaEstatal] = useState(categoria?.categoria_estatal || '');
  const [categoriaFederal, setCategoriaFederal] = useState(categoria?.categoria_federal || '');
  const [activo, setActivo] = useState(categoria?.activo || true);
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      const data = { nombre, categoria_estatal: categoriaEstatal, categoria_federal: categoriaFederal, activo };
      if (categoria?.id) {
        await axios.put(`${config.API.CATEGORIAS}/${categoria.id}`, data);
        toast({
          title: 'Categoría actualizada.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(config.API.CATEGORIAS, data);
        toast({
          title: 'Categoría creada.',
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
        description: error.response?.data?.message || 'Hubo un error al guardar la categoría.',
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
      <FormControl mb={4}>
        <FormLabel>Categoría Estatal</FormLabel>
        <Input value={categoriaEstatal} onChange={(e) => setCategoriaEstatal(e.target.value)} />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Categoría Federal</FormLabel>
        <Input value={categoriaFederal} onChange={(e) => setCategoriaFederal(e.target.value)} />
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

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchCategorias = async () => {
    try {
      const { data } = await axios.get(`${config.API.CATEGORIAS}?soloActivo=${activeOnly}`);
      setCategorias(data);
      setFilteredCategorias(data);
    } catch (error) {
      toast({
        title: 'Error al cargar las categorías.',
        description: 'No se pudieron obtener los datos del servidor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [activeOnly]);

  useEffect(() => {
    const results = categorias.filter(
      (categoria) =>
        categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (categoria.categoria_estatal && categoria.categoria_estatal.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (categoria.categoria_federal && categoria.categoria_federal.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCategorias(results);
  }, [searchTerm, categorias]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await axios.delete(`${config.API.CATEGORIAS}/${id}`);
        toast({
          title: 'Categoría eliminada.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchCategorias();
      } catch (error) {
        toast({
          title: 'Error al eliminar.',
          description: 'No se pudo eliminar la categoría.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleEdit = (categoria) => {
    setSelectedCategoria(categoria);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedCategoria(null);
    onOpen();
  };

  const handleNavigateToProfesores = (categoriaId) => {
    navigate(`/categorias/${categoriaId}/profesores`);
  };

  const handleNavigateToRequisitos = (categoriaId) => {
    navigate(`/categorias/${categoriaId}/requisitos`);
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="xl" color="gray.700">
          Gestión de Categorías
        </Heading>
        <Tooltip label="Añadir nueva categoría" placement="left">
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
            placeholder="Buscar por nombre o categoría..."
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

      <Box bg="white" p={6} borderRadius="xl" boxShadow="lg" overflowX="auto">
        <TableContainer>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Nombre</Th>
                <Th>Categoría Estatal</Th>
                <Th>Categoría Federal</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
                <Th>Relaciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCategorias.map((categoria) => (
                <Tr key={categoria.id}>
                  <Td>{categoria.id}</Td>
                  <Td>{categoria.nombre}</Td>
                  <Td>{categoria.categoria_estatal || '-'}</Td>
                  <Td>{categoria.categoria_federal || '-'}</Td>
                  <Td>
                    <Badge colorScheme={categoria.activo ? 'green' : 'red'}>
                      {categoria.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="yellow"
                        onClick={() => handleEdit(categoria)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(categoria.id)}
                      />
                    </Flex>
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      <Tooltip label="Ver profesores">
                        <IconButton
                          icon={<ExternalLinkIcon />}
                          size="sm"
                          colorScheme="teal"
                          onClick={() => handleNavigateToProfesores(categoria.id)}
                        />
                      </Tooltip>
                      <Tooltip label="Ver requisitos">
                        <IconButton
                          icon={<ExternalLinkIcon />}
                          size="sm"
                          colorScheme="purple"
                          onClick={() => handleNavigateToRequisitos(categoria.id)}
                        />
                      </Tooltip>
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
            {selectedCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CategoriaForm
              categoria={selectedCategoria}
              onClose={onClose}
              onSave={fetchCategorias}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}