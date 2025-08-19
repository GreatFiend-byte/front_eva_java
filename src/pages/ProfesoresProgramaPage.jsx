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
    const toast = useToast();

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
            // Obtener información del programa
            const programaRes = await axios.get(`${config.API.PROGRAMA_EDUCATIVO}/${id}`);
            setPrograma(programaRes.data);
            
            // Obtener profesores del programa
            const profesoresRes = await axios.get(`${config.API.PROGRAMA_EDUCATIVO}/${id}/profesores`);
            setProfesores(profesoresRes.data);
            
            // Obtener todos los profesores disponibles del microservicio
            const profResponse = await axios.get(`${config.API.PROFESOR}?soloactivo=false`);
            setTodosProfesores(profResponse.data);
            
            setError(null);
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('No se pudieron cargar los datos del programa educativo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const handleBack = () => {
        navigate(-1);
    };

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

        setAsignando(true);
        try {
            // Obtener el profesor completo seleccionado
            const profesor = todosProfesores.find(p => p.id === parseInt(profesorSeleccionado));
            
            if (!profesor) {
                throw new Error("Profesor no encontrado");
            }

            // Usar el endpoint PUT para asignar el profesor
            await axios.put(`${config.API.PROGRAMA_EDUCATIVO}/asignar-profesor/${id}`, profesor);
            
            toast({
                title: 'Profesor asignado correctamente',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            // Recargar los datos
            cargarDatos();
            setProfesorSeleccionado('');
        } catch (err) {
            console.error('Error asignando profesor:', err);
            toast({
                title: 'Error al asignar profesor',
                description: err.response?.data?.mensaje || err.message || 'Inténtalo de nuevo más tarde',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setAsignando(false);
        }
    };

    // Filtrar profesores que no están asignados a este programa
    const profesoresDisponibles = todosProfesores.filter(
        profesor => !profesores.some(p => p.id === profesor.id)
    );

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

            {/* Sección para asignar nuevo profesor */}
            <Box bg="white" p={6} borderRadius="xl" boxShadow="lg" mb={6}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>Asignar nuevo profesor</Text>
                <Flex gap={4} alignItems="flex-end">
                    <Select
                        placeholder="Selecciona un profesor"
                        value={profesorSeleccionado}
                        onChange={(e) => setProfesorSeleccionado(e.target.value)}
                        flex="1"
                    >
                        {profesoresDisponibles.map(profesor => (
                            <option key={profesor.id} value={profesor.id}>
                                {profesor.nombre} {profesor.apellidos} - {profesor.clavepe}
                            </option>
                        ))}
                    </Select>
                    <Button 
                        colorScheme="teal" 
                        onClick={asignarProfesor}
                        isLoading={asignando}
                        isDisabled={!profesorSeleccionado}
                        leftIcon={<AddIcon />}
                    >
                        Asignar Profesor
                    </Button>
                </Flex>
                {profesoresDisponibles.length === 0 && (
                    <Text color="gray.500" fontSize="sm" mt={2}>
                        No hay profesores disponibles para asignar.
                    </Text>
                )}
            </Box>

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
                    
                    <Text fontSize="sm" color="gray.500">
                        Total de profesores: {profesores.length}
                    </Text>
                </Flex>

                {profesores.length > 0 ? (
                    <TableContainer>
                        <Table variant="striped" colorScheme="gray">
                            <Thead>
                                <Tr>
                                    <Th>ID</Th>
                                    <Th>Nombre</Th>
                                    <Th>Clave PE</Th>
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
                                                    bg="teal.500"
                                                />
                                                <Text>
                                                    {profesor.nombre} {profesor.apellidos}
                                                </Text>
                                            </Stack>
                                        </Td>
                                        <Td>{profesor.clavepe}</Td>
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
        </Box>
    );
}
