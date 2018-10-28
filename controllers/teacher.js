
const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Course = require('../models/Course');
const Group = require('../models/Group')

const projectId = process.env.DFPROJECT_ID;
const client_email = process.env.DFCLIENT_EMAIL;
const private_key = process.env.DFPRIVATE_KEY;
const sessionId = 'quickstart-session-id';

var credentials = {
  credentials: {
    client_email,
    private_key
  },
  projectId
}

const query = 'Hola, como te llamas?';
const languageCode = 'es-ES';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');

exports.home = (req, res) => {
  res.render('home', {
    title: 'Inicio'
  });
};

exports.getCourses = (req, res) => {
  Course
  .find({ idTeacher: req.user._id })
  .exec((err, getCourses) => {
    if (err) return res.status(500).json({ err })

    res.render('teacher/courses', {
      title: 'Ver cursos asignados',
      cursos: getCourses
    });
  })
}

exports.getCourse = (req, res) => {
  Course
  .findOne({ _id: req.params.id, idTeacher: req.user._id })
  .populate('idTeacher')
  .exec((err, course) => {
    if (err) return res.status(500).json({ err })

    Group
    .find({ idCourse: course._id })
    .exec((err, getGroups) => {
      if (err) return res.status(500).json({ err })
      console.log(getGroups)
      res.render('teacher/course', {
        title: 'Ver curso',
        curso: course,
        grupos: getGroups
      });
    })
  })
}

exports.getCreateGroup = (req, res) => {
  Course
  .findById(req.params.id)
  .exec((err, course) => {
    if (err) return res.status(500).json({ err })
    console.log(course)
    res.render('teacher/createGroup', {
      title: 'Crear grupo',
      curso: course
    })
  })
}

exports.postCreateGroup = (req, res) => {
  // return res.send(req.body)
  var newGroup = new Group({
    title: req.body.title,
    description: req.body.description,
    idCourse: req.body.idCourse
  })

  newGroup.save((err, createGroup) => {
    if (err) return res.status(500).json({ err })
    console.log(createGroup)
    req.flash('success', { msg: `El grupo ha sido creado` });
    res.redirect(`/profesor/cursos/${createGroup.idCourse}`)
  })
}

exports.getUpdateGroup = (req, res) => {
  Group
  .findOne({ _id: req.params.idGroup, idCourse: req.params.id })
  .exec((err, getGroup) => {
    if (err) return res.status(500).json({ err })
    res.render('teacher/updateGroup', {
      title: 'Editar Grupo',
      grupo: getGroup
    })
  })
}

exports.postUpdateGroup = (req, res) => {
  // return res.send(req.body)
  Group
  .findById(req.params.idGroup)
  .exec((err, group) => {
    if (err) return res.status(500).json({ err })
    group.title = req.body.title || group.title;
    group.description = req.body.description || group.description;

    group.save((err, savedGroup) => {
      if (err) return res.status(500).json({ err })
      req.flash('success', { msg: `El grupo ha sido actualizado` });
      res.redirect(`/profesor/cursos/${savedGroup.idCourse}`)
    })
  })
}

exports.getChatbots = (req, res) => {
  // const sessionClient = new dialogflow.SessionsClient({
  //   credentials: {
  //     client_email,
  //     private_key
  //   },
  //   projectId
  // });
  // // Define session path
  // const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  
  // // The text query request.
  // const request = {
  //   session: sessionPath,
  //   queryInput: {
  //     text: {
  //       text: query,
  //       languageCode: languageCode,
  //     },
  //   },
  // };
  
  // // Send request and log result
  // sessionClient
  //   .detectIntent(request)
  //   .then(responses => {
  //     console.log('Detected intent');
  //     const result = responses[0].queryResult;
  //     console.log(`  Query: ${result.queryText}`);
  //     console.log(`  Response: ${result.fulfillmentText}`);
  //     if (result.intent) {
  //       console.log(`  Intent: ${result.intent.displayName}`);
  //     } else {
  //       console.log(`  No intent matched.`);
  //     }
  //   })
  //   .catch(err => {
  //     console.error('ERROR:', err);
  //   });

  const intentsClient = new dialogflow.IntentsClient(credentials);

  const projectAgentPath = intentsClient.projectAgentPath(projectId, sessionId);

  const request = {
    parent: projectAgentPath,
    intentView: 'INTENT_VIEW_FULL'
  };

  intentsClient
    .listIntents(request)
    .then(responses => {
      responses[0].forEach(intent => {
        console.log('====================');
        console.log(`id: ${intent.name.split('/')[4]}`);
        console.log(`Nombre: ${intent.displayName}`);
        console.log(`preguntas: ${JSON.stringify(intent.trainingPhrases)}`)
        console.log(`respuestas: ${JSON.stringify(intent.messages)}`)
      });
    })
    .catch(err => {
      console.error('Error al enumerar intenciones:', err);
    });

  res.render('teacher/chatbots', {
    title: 'Lista de chatbots',
    // resultado: result
  })

}

exports.getChatbot = (req, res) => {
  res.render('teachear/chatbot', {
    title: 'Detalle Chatbot'
  })
}

exports.getCreateChatbot = (req, res) => {
  res.render('teacher/createChatbot', {
    title: 'Crear chatbot'
  })
}

exports.postCreateChatbot = (req, res) => {
  return res.send(req.body)
}

exports.getUpdateChatbot = (req, res) => {
  res.render('teacher/updateChatbot', {
    title: 'Actualizar chatbot'
  })
}

exports.postUpdateChatbot = (req, res) => {
  return res.send(req.body)
}