const API_DIV_URL = import.meta.env.VITE_API_DIV_URL || 'http://localhost:8080';
const API_PROF_URL = import.meta.env.VITE_API_PROF_URL || 'http://localhost:8081';
const API_CAT_URL = import.meta.env.VITE_API_CAT_URL || 'http://localhost:8082';
const API_LOGI_URL = import.meta.env.VITE_API_LOGI_URL || 'http://localhost:8083';


export const config = {
  API: {
    DIVISION: `${API_DIV_URL}/api/division`,
    PROGRAMA_EDUCATIVO: `${API_DIV_URL}/api/programaeducativo`,
    PROFESOR: `${API_PROF_URL}/api/profesor`,
    LOGIN: `${API_LOGI_URL}/api/auth/login`,
    VALIDATE: `${API_LOGI_URL}/api/auth/validate`,
    CATEGORIAS: `${API_CAT_URL}/api/categorias`,
    CATEGORIAS_TIPO_REQUISITOS: `${API_CAT_URL}/api/categoria-tipo-requisito`,
    REQUISITOS: `${API_CAT_URL}/api/requisitos`,
    TIPOS_REQUISITOS: `${API_CAT_URL}/api/tipos-requisitos`,
  }
};