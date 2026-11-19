import multer from 'multer';
import path from 'path';
import fs from 'node:fs';

const diretoriosUpload = {
    comprovante_residencia: "uploads/comprovantes-residencia/",
    comprovante_uniao: "uploads/comprovantes-uniao/",
    comprovante_renda: "uploads/comprovantes-renda/"
};

// Configura como e onde salvar os arquivos no disco local
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const diretorio = diretoriosUpload[file.fieldname];
        if (!diretorio) {
            return cb(new Error("Campo de upload inválido."));
        }
        fs.mkdir(diretorio, { recursive: true }, (erro) => cb(erro, diretorio));
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

export const uploadComprovanteRenda = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const extensoesPorTipo = {
            "application/pdf": [".pdf"],
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"]
        };
        const extensoes = extensoesPorTipo[file.mimetype];
        const extensao = path.extname(file.originalname).toLowerCase();

        if (!extensoes?.includes(extensao)) {
            const erro = new Error("Envie o comprovante de renda em PDF, PNG ou JPG.");
            erro.code = "TIPO_ARQUIVO_INVALIDO";
            return cb(erro);
        }

        return cb(null, true);
    }
}).single("comprovante_renda");
