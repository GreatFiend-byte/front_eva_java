import {
    Box,
    Heading,
    Text,
    Spinner,
    Alert,
    AlertIcon,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Flex,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Switch,
    Stack,
    useToast,
    IconButton,
    Tooltip,
    Badge,
    Avatar,
    AvatarGroup,
    List,
    ListItem,
    ListIcon,
    InputGroup,
    InputLeftElement
} from '@chakra-ui/react';
import { ArrowBackIcon, SearchIcon } from '@chakra-ui/icons';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon, CheckIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

function ProgramaEducativoForm({ initialData, onSave, onClose, isNew }) {
    const [formData, setFormData] = useState(initialData || { clave: '', programaEducativo: '', activo: true, division: { id: initialData?.division?.id || null } });
    const toast = useToast();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isNew) {
                await axios.post(`${config.API.PROGRAMA_EDUCATIVO}?idDivision=${formData.division.id}`, {
                    clave: formData.clave,
                    programaEducativo: formData.programaEducativo,
                    activo: formData.activo,
                });
                toast({ title: 'Programa creado.', status: 'success', duration: 3000, isClosable: true });
            } else {
                await axios.put(`${config.API.PROGRAMA_EDUCATIVO}/${initialData.id}`, formData);
                toast({ title: 'Programa actualizado.', status: 'success', duration: 3000, isClosable: true });
            }
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            toast({
                title: 'Error.',
                description: isNew ? 'No se pudo crear el programa.' : 'No se pudo actualizar el programa.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
                <FormControl id="clave" isRequired>
                    <FormLabel>Clave</FormLabel>
                    <Input name="clave" value={formData.clave || ''} onChange={handleChange} />
                </FormControl>
                <FormControl id="programaEducativo" isRequired>
                    <FormLabel>Nombre del Programa</FormLabel>
                    <Input name="programaEducativo" value={formData.programaEducativo || ''} onChange={handleChange} />
                </FormControl>
                <FormControl id="activo" display="flex" alignItems="center">
                    <FormLabel htmlFor="activo" mb="0">
                        Activo
                    </FormLabel>
                    <Switch name="activo" isChecked={formData.activo} onChange={handleChange} />
                </FormControl>
            </Stack>
            <Flex mt={6} justifyContent="flex-end">
                <Button colorScheme="red" mr={3} onClick={onClose}>Cancelar</Button>
                <Button colorScheme="blue" type="submit">Guardar</Button>
            </Flex>
        </form>
    );
}

export default function ProgramasDeDivisionPage() {
    const { id } = useParams();
    const [programas, setProgramas] = useState([]);
    const [filteredProgramas, setFilteredProgramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profesores, setProfesores] = useState([]);
    const [profesoresLoading, setProfesoresLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeOnly, setActiveOnly] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const [selectedPrograma, setSelectedPrograma] = useState(null);
    
    // Modals
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isProfesoresOpen, onOpen: onProfesoresOpen, onClose: onProfesoresClose } = useDisclosure();

    const fetchProgramas = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${config.API.DIVISION}/${id}/programas`);
            setProgramas(data);
            setFilteredProgramas(data);
            setError(null);
        } catch (err) {
            setError('No se pudieron cargar los programas educativos de esta división.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProgramas();
        }
    }, [id]);

    useEffect(() => {
        let results = programas;
        
        // Aplicar filtro de activos
        if (activeOnly) {
            results = results.filter(programa => programa.activo);
        }
        
        // Aplicar filtro de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(programa => 
                programa.clave.toLowerCase().includes(term) || 
                programa.programaEducativo.toLowerCase().includes(term)
            );
        }
        
        setFilteredProgramas(results);
    }, [programas, activeOnly, searchTerm]);

    const handleDelete = async () => {
        if (!selectedPrograma) return;
        try {
            await axios.delete(`${config.API.PROGRAMA_EDUCATIVO}/${selectedPrograma.id}`);
            toast({ title: 'Programa eliminado.', status: 'success', duration: 3000, isClosable: true });
            fetchProgramas();
            onDeleteClose();
        } catch (err) {
            toast({ title: 'Error.', description: 'No se pudo eliminar el programa.', status: 'error', duration: 5000, isClosable: true });
            console.error(err);
        }
    };

    const handleShowProfesores = (programa) => {
        navigate(`/programas/${programa.id}/profesores`);
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh">
                <Spinner size="xl" color="teal.500" />
            </Flex>
        );
    }

    if (error) {
        return (
            <Box p={8}>
                <Alert status="error" rounded="lg">
                    <AlertIcon />
                    {error}
                </Alert>
                <Button mt={4} leftIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Regresar
                </Button>
            </Box>
        );
    }

    return (
        <Box p={8} bg="gray.50" minH="100vh">
            <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Regresar
                </Button>
                <Heading as="h1" size="xl" color="gray.700">
                    Programas Educativos
                </Heading>
                <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onCreateOpen}>
                    Crear Programa
                </Button>
            </Flex>

            <Flex mb={6} gap={4}>
                <InputGroup maxW="400px">
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.300" />
                    </InputLeftElement>
                    <Input
                        placeholder="Buscar por clave o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        bg="white"
                    />
                </InputGroup>
                <FormControl display="flex" alignItems="center" width="auto">
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

            {filteredProgramas.length > 0 ? (
                <TableContainer bg="white" p={6} borderRadius="xl" boxShadow="lg">
                    <Table variant="simple" size="md">
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Clave</Th>
                                <Th>Nombre</Th>
                                <Th>Estado</Th>
                                <Th>Profesores</Th>
                                <Th>Acciones</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredProgramas.map((programa) => (
                                <Tr key={programa.id}>
                                    <Td>{programa.id}</Td>
                                    <Td>{programa.clave}</Td>
                                    <Td>{programa.programaEducativo}</Td>
                                    <Td>
                                        <Badge colorScheme={programa.activo ? 'green' : 'red'}>
                                            {programa.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Tooltip label="Ver profesores asignados">
                                            <IconButton
                                                aria-label="Ver profesores"
                                                icon={<ViewIcon />}
                                                size="sm"
                                                colorScheme="teal"
                                                onClick={() => handleShowProfesores(programa)}
                                            />
                                        </Tooltip>
                                    </Td>
                                    <Td>
                                        <Stack direction="row" spacing={2}>
                                            <Tooltip label="Editar" hasArrow>
                                                <IconButton
                                                    aria-label="Editar"
                                                    icon={<EditIcon />}
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedPrograma(programa);
                                                        onEditOpen();
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip label="Eliminar" hasArrow>
                                                <IconButton
                                                    aria-label="Eliminar"
                                                    icon={<DeleteIcon />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    onClick={() => {
                                                        setSelectedPrograma(programa);
                                                        onDeleteOpen();
                                                    }}
                                                />
                                            </Tooltip>
                                        </Stack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            ) : (
                <Box textAlign="center" py={10}>
                    <Text color="gray.500" fontSize="xl">
                        {programas.length === 0 
                            ? 'No hay programas educativos para esta división.'
                            : 'No se encontraron programas que coincidan con los filtros.'}
                    </Text>
                </Box>
            )}

            {/* Modal para Crear Programa */}
            <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Crear Programa Educativo</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <ProgramaEducativoForm
                            isNew={true}
                            initialData={{ clave: '', programaEducativo: '', activo: true, division: { id: parseInt(id) } }}
                            onSave={fetchProgramas}
                            onClose={onCreateClose}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Modal para Editar Programa */}
            <Modal isOpen={isEditOpen} onClose={onEditClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Editar Programa Educativo</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <ProgramaEducativoForm
                            isNew={false}
                            initialData={selectedPrograma}
                            onSave={fetchProgramas}
                            onClose={onEditClose}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Modal de Confirmación de Eliminación */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirmar Eliminación</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            ¿Estás seguro de que quieres eliminar el programa educativo
                            <strong> {selectedPrograma?.programaEducativo}</strong>?
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" onClick={handleDelete} mr={3}>
                            Eliminar
                        </Button>
                        <Button variant="ghost" onClick={onDeleteClose}>Cancelar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal para Mostrar Profesores */}
            <Modal isOpen={isProfesoresOpen} onClose={onProfesoresClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Profesores del programa: {selectedPrograma?.programaEducativo}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {profesoresLoading ? (
                            <Flex justify="center">
                                <Spinner size="xl" color="teal.500" />
                            </Flex>
                        ) : profesores.length > 0 ? (
                            <List spacing={3}>
                                {profesores.map((profesor) => (
                                    <ListItem key={profesor.id} p={2} borderBottom="1px" borderColor="gray.100">
                                        <Flex align="center">
                                            <ListIcon as={CheckIcon} color="green.500" />
                                            <Box>
                                                <Text fontWeight="bold">
                                                    {profesor.nombre} {profesor.apellidos}
                                                </Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    Clave PE: {profesor.clavepe} | Género: {profesor.genero === 'M' ? 'Masculino' : 'Femenino'}
                                                </Text>
                                            </Box>
                                        </Flex>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Text color="gray.500" textAlign="center">
                                No hay profesores asignados a este programa.
                            </Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={onProfesoresClose}>
                            Cerrar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}