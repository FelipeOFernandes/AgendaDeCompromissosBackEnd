import { Router } from 'express';
import Agendamento from '@/app/schemas/Agendamento';
import { route } from 'express/lib/application';
import slugify from 'slugify';

const router = new Router();

router.get('/', (req, res) => {
  Agendamento.find()
    .then((dados) => {
      const agendamentos = dados.map((agendamento) => {
        return {
          id: agendamento.id,
          descricao: agendamento.descricao,
          link: agendamento.link,
          dataHora: agendamento.dataHora,
        };
      });
      res.status(200).send(agendamentos);
    })
    .catch((error) => {
      console.error('Erro ao buscar os agendamentos no banco de dados', error);
      res.status(400).send({
        error:
          'Não possível obter os dados dos agendamentos, tente novamente mais tarde',
      });
    });
});

router.get('/:link', (req, res) => {
  Agendamento.findOne({ link: req.params.link })
    .then((agendamento) => {
      res.status(200).send(agendamento);
    })
    .catch((error) => {
      console.error('Erro ao buscar o agendamento no banco de dados', error);
      res.status(400).send({
        error:
          'Não possível obter os dados do agendamento, tente novamente mais tarde',
      });
    });
});

router.post('/', (req, res) => {
  const { descricao, local, dataHora } = req.body;
  Agendamento.create({ descricao, local, dataHora })
    .then((agendamento) => {
      res.status(200).send(agendamento);
    })
    .catch((error) => {
      console.error(
        'Erro ao salvar um novo agendamento no banco de dados',
        error,
      );
      res
        .status(400)
        .send(
          'Não foi possível salvar seu agendamento. Verifique os dados e tente novamente',
        );
    });
});

router.put('/:idAgendamento', (req, res) => {
  const { descricao, local, dataHora } = req.body;
  let link;
  if (descricao) {
    link = slugify(descricao);
  }

  Agendamento.findByIdAndUpdate(
    req.params.idAgendamento,
    { descricao, local, link, dataHora },
    { new: true },
  )
    .then((agendamento) => {
      res.status(200).send(agendamento);
    })
    .catch((error) => {
      console.error('Erro ao atualizar o agendamento no banco de dados', error);
      res
        .status(400)
        .send(
          'Não foi possível atualizar seu agendamento. Verifique os dados e tente novamente',
        );
    });
});

router.delete('/:idAgendamento', (req, res) => {
  Agendamento.findByIdAndRemove(req.params.idAgendamento)
    .then(() => {
      res.status(200).send({ mensagem: 'Agendamento removido com sucesso' });
    })
    .catch((error) => {
      console.error('Erro ao remover o agendamento no banco de dados', error);
      res
        .status(400)
        .send(
          'Não foi possível remover seu agendamento. Verifique os dados e tente novamente',
        );
    });
});

export default router;
