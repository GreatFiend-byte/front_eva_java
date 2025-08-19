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
    Badge,
    Stack,
    useToast,
    Avatar,
    Select,
    FormControl,
    FormLabel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

export default function ProfesoresProgramaPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profesores, setProfesores] = useState([]);
    const [programa, setPrograma] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [todosProfesores, setTodosProfesores] = useState([]);
    const [profesorSeleccionado, setProfesorSeleccionado] = useState('');
    const [asignando, setAsignando] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Obtener información del programa
                const programaRes = await axios.get(`${config.API.PROGRAMA_EDUCATIVO}/${id}`);
                setPrograma(programaRes.data);
                
                // Obtener profesores del programa
                const profesoresRes = await axios.get(`${config.API.PROGRAMA_EDUCATIVO}/${id}/profesores`);
                // Asegurarnos de que siempre sea un array
                setProfesores(Array.isArray(profesoresRes.data) ? profesoresRes.data : []);
                
                // Obtener todos los profesores disponibles
                const todosProfesoresRes = await axios.get(`${config.API.PROFESORES}`);
                // Asegurarnos de que siempre sea un array
                setTodosProfesores(Array.isArray(todosProfesoresRes.data) ? todosProfesoresRes.data : []);
                
                setError(null);
            } catch (err) {
                setError('No se pudieron cargar los datos del programa educativo.');
                console.error('Error fetching data:', err);
                // Asegurar que sean arrays incluso en caso de error
                setProfesores([]);
                setTodosProfesores([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleAsignarProfesor = async () => {
        if (!profesorSeleccionado) {
            toast({
                title: "Selecciona un profesor",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setAsignando(true);
        try {
            // Obtener datos completos del profesor seleccionado
            const profesor = todosProfesores.find(p => p.id === parseInt(profesorSeleccionado));
            
            if (!profesor) {
                throw new Error("Profesor no encontrado");
            }
            
            // Realizar la asignación
            await axios.put(`${config.API.PROGRAMA_EDUCATIVO}/asignar-profesor/${id}`, profesor);
            
            // Actualizar la lista de profesores
            const profesoresRes = await axios.get(`${config.API.PROGRAMA_EDUCATIVO}/${id}/profesores`);
            setProfesores(Array.isArray(profesoresRes.data) ? profesoresRes.data : []);
            
            // Cerrar modal y resetear selección
            onClose();
            setProfesorSeleccionado('');
            
            toast({
                title: "Profesor asignado correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            console.error('Error asignando profesor:', err);
            toast({
                title: "Error al asignar profesor",
                description: err.response?.data?.mensaje || err.message || "Inténtalo de nuevo más tarde",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setAsignando(false);
        }
    };

    // Filtrar profesores que aún no están asignados a este programa
    // Asegurarnos de que ambos sean arrays antes de usar filter
    const profesoresDisponibles = Array.isArray(todosProfesores) && Array.isArray(profesores) 
        ? todosProfesores.filter(
            profesor => !profesores.some(p => p.id === profesor.id)
          )
        : [];

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
                <Button mt={4} leftIcon={<ArrowBackIcon />} onClick={handleBack}>
                    Regresar
                </Button>
            </Box>
        );
    }

    return (
        <Box p={8} bg="gray.50" minH="100vh">
            <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <Button leftIcon={<ArrowBackIcon />} onClick={handleBack}>
                    Regresar
                </Button>
                
                <Heading as="h1" size="xl" color="gray.700" textAlign="center">
                    Profesores del Programa: {programa?.programaEducativo}
                </Heading>
                
                <Box w="100px" /> {/* Espacio para alinear */}
            </Flex>

            <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
                <Flex mb={6} justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={4} align="center">
                        <Text fontSize="lg" fontWeight="bold">Clave:</Text>
                        <Badge colorScheme="blue" fontSize="lg">{programa?.clave}</Badge>
                        
                        <Text fontSize="lg" fontWeight="bold">Estado:</Text>
                        <Badge colorScheme={programa?.activo ? 'green' : 'red'} fontSize="lg">
                            {programa?.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </Stack>
                    
                    <Flex alignItems="center">
                        <Text fontSize="sm" color="gray.500" mr={4}>
                            Total de profesores: {profesores.length}
                        </Text>
                        <Button 
                            colorScheme="teal" 
                            leftIcon={<AddIcon />} 
                            onClick={onOpen}
                            isDisabled={profesoresDisponibles.length === 0}
                        >
                            Asignar Profesor
                        </Button>
                    </Flex>
                </Flex>

                {profesores.length > 0 ? (
                    <TableContainer>
                        <Table variant="striped" colorScheme="gray">
                            <Thead>
                                <Tr>
                                    <Th>ID</Th>
                                    <Th>Nombre</Th>
                                    <Th>Clave PE</Th>
                                    <Th>Género</Th>
                                    <Th>Estado</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {profesores.map((profesor) => (
                                    <Tr key={profesor.id}>
                                        <Td>{profesor.id}</Td>
                                        <Td>
                                            <Stack direction="row" align="center" spacing={3}>
                                                <Avatar 
                                                    name={`${profesor.nombre} ${profesor.apellidos}`} 
                                                    size="sm" 
                                                    bg={profesor.genero === 'F' ? 'pink.500' : 'teal.500'}
                                                />
                                                <Text>
                                                    {profesor.nombre} {profesor.apellidos}
                                                </Text>
                                            </Stack>
                                        </Td>
                                        <Td>{profesor.clavepe}</Td>
                                        <Td>{profesor.genero === 'M' ? 'Masculino' : 'Femenino'}</Td>
                                        <Td>
                                            <Badge colorScheme={profesor.activo ? 'green' : 'red'}>
                                                {profesor.activo ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box textAlign="center" py={10}>
                        <Text fontSize="xl" color="gray.500">
                            No hay profesores asignados a este programa educativo.
                        </Text>
                    </Box>
                )}
            </Box>

            {/* Modal para asignar profesor */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Asignar Profesor al Programa</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>Selecciona un profesor</FormLabel>
                            <Select
                                placeholder="Selecciona un profesor"
                                value={profesorSeleccionado}
                                onChange={(e) => setProfesorSeleccionado(e.target.value)}
                            >
                                {profesoresDisponibles.map((profesor) => (
                                    <option key={profesor.id} value={profesor.id}>
                                        {profesor.nombre} {profesor.apellidos} - {profesor.clavepe}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button 
                            colorScheme="teal" 
                            mr={3} 
                            onClick={handleAsignarProfesor}
                            isLoading={asignando}
                            isDisabled={!profesorSeleccionado}
                        >
                            Asignar
                        </Button>
                        <Button onClick={onClose} isDisabled={asignando}>Cancelar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
