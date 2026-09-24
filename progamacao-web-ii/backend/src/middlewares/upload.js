import multer from 'multer';
import path from 'path';

// Configura como e onde salvar os arquivos no disco local
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Aponta para a pasta 'uploads' dentro da raiz do backend
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Gera um nome único (timestamp + número aleatório + extensão)
        // Exemplo: comprovante-1727000000000-123456789.pdf
        const sufixoUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extensao = path.extname(file.originalname);
        
        cb(null, `${file.fieldname}-${sufixoUnico}${extensao}`);
    }
});

// Instância do Multer exportada para uso nas rotas
export const upload = multer({ storage });