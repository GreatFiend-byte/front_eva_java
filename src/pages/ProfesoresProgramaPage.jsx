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
    FormControl,
    FormLabel,
    Select,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

export default function ProfesoresProgramaPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profesores, setProfesores] = useState([]);
    const [profesoresDisponibles, setProfesoresDisponibles] = useState([]);
    const [profesorSeleccionado, setProfesorSeleccionado] = useState('');
    const [programa, setPrograma] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();

    // Función para obtener todos los datos
    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Obtener información del programa
            const programaRes = await axios.get(`${config.API.PROGRAMA_EDUCATIVO}/${id}`);
            setPrograma(programaRes.data);
            
            // Obtener profesores del programa
            const profesoresRes = await axios.get(`${config.API.PROGRAMA_EDUCATIVO}/${id}/profesores`);
            setProfesores(profesoresRes.data);
            
            // Obtener todos los profesores disponibles
            const profResponse = await axios.get(`${config.API.PROFESOR}?soloactivo=false`);
            setProfesoresDisponibles(profResponse.data);

            setError(null);
        } catch (err) {
            setError('No se pudieron cargar los profesores o el programa educativo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleAsignarProfesor = async () => {
        if (!profesorSeleccionado) {
            toast({
                title: 'No hay profesor seleccionado',
                description: 'Por favor, selecciona un profesor de la lista.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const profesorAsignar = profesoresDisponibles.find(prof => prof.id.toString() === profesorSeleccionado);
            if (!profesorAsignar) {
                throw new Error("Profesor no encontrado en la lista de disponibles.");
            }

            // Realizar la petición PUT al endpoint
            await axios.put(`${config.API.PROGRAMA_EDUCATIVO}/asignar-profesor/${id}`, profesorAsignar);
            
            toast({
                title: 'Profesor asignado.',
                description: "El profesor ha sido asignado al programa educativo exitosamente.",
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Refrescar los datos después de la asignación
            fetchData();
            setProfesorSeleccionado('');
        } catch (err) {
            console.error("Error al asignar profesor:", err);
            toast({
                title: 'Error al asignar.',
                description: 'No se pudo asignar el profesor. Inténtalo de nuevo.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // Filtrar los profesores disponibles que no están asignados
    const profesoresNoAsignados = profesoresDisponibles.filter(profesorDisp =>
        !profesores.some(profesorAsignado => profesorAsignado.id === profesorDisp.id)
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

                {/* Formulario para asignar profesores */}
                <Box mb={8}>
                    <Heading size="md" mb={4}>Asignar nuevo profesor</Heading>
                    <Flex gap={4} alignItems="flex-end">
                        <FormControl flex="1">
                            <FormLabel htmlFor="profesor-select">
                                Selecciona un profesor disponible:
                            </FormLabel>
                            <Select
                                id="profesor-select"
                                placeholder="Selecciona un profesor"
                                value={profesorSeleccionado}
                                onChange={(e) => setProfesorSeleccionado(e.target.value)}
                            >
                                {profesoresNoAsignados.map((profesor) => (
                                    <option key={profesor.id} value={profesor.id}>
                                        {profesor.nombre} {profesor.apellidos}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            colorScheme="teal"
                            onClick={handleAsignarProfesor}
                            isDisabled={!profesorSeleccionado}
                        >
                            Asignar Profesor
                        </Button>
                    </Flex>
                </Box>
                {/* Fin del formulario para asignar profesores */}

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
        </Box>
    );
}
