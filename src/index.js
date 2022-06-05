import express, { Router } from 'express';
import bodyParser from 'body-parser';
import { Compromisso, Auth } from '@/app/controllers';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/compromisso', Compromisso);
app.use('/auth', Auth);

console.log(`Servidor ligado na porta ${port}`);
app.listen(port);
