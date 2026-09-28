import express from 'express' // importa o framework Express
import alunosRoutes from './routes/alunos.routes.js'

const app =  express()

// Express deve interpretar o corpo (body) como JSON
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({
        mensagem: 'API REST funcionando'
    })
})

app.use('/alunos', alunosRoutes) // Define "/alunos" como prefixo para todas as rotas de alunos

export default app; //preciso exportar para usar em outros módulos




