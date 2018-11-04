
const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Course = require('../models/Course');
const Group = require('../models/Group')
const Chatbot = require('../models/Chatbot');

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
    console.log(getCourses)
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
    .populate('students')
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
  // const intentsClient = new dialogflow.IntentsClient(credentials);

  // const projectAgentPath = intentsClient.projectAgentPath(projectId, sessionId);

  // const request = {
  //   parent: projectAgentPath,
  //   intentView: 'INTENT_VIEW_FULL'
  // };

  // intentsClient
  //   .listIntents(request)
  //   .then(responses => {
  //     responses[0].forEach(intent => {
  //       console.log('====================');
  //       console.log(`id: ${intent.name.split('/')[4]}`);
  //       console.log(`Nombre: ${intent.displayName}`);
  //       console.log(`preguntas: ${JSON.stringify(intent.trainingPhrases)}`)
  //       console.log(`respuestas: ${JSON.stringify(intent.messages)}`)
  //     });
  //   })
  //   .catch(err => {
  //     console.error('Error al enumerar intenciones:', err);
  //   });
  Chatbot
  .find({ creatorTeacher: req.user._id })
  .exec((err, chatbots) => {
    console.log(chatbots)
    if (err) return res.status(500).json({ err })
    res.render('teacher/chatbots', {
      title: 'Lista de chatbots',
      chatbots
    })
  })

}

exports.getChatbot = (req, res) => {
  res.render('teacher/chatbot', {
    title: 'Detalle Chatbot'
  })
}

exports.getCreateChatbot = (req, res) => {
  Course
  .find({ idTeacher: req.user._id })
  .exec((err, courses) => {
    if (err) return res.status(500).json({ courses })
    
    res.render('teacher/createChatbot', {
      title: 'Crear chatbot',
      cursos: courses
    })
  })
}

exports.postCreateChatbot = (req, res) => {
  
  const intentsClient = new dialogflow.IntentsClient(credentials);
  
  const agentPath = intentsClient.projectAgentPath(projectId, sessionId);

  const displayName = req.body.nombreIntencion

  const trainingPhrases = [];

  const trainingPhrasesParts = req.body.preguntas

  const messageTexts = req.body.respuestas

  trainingPhrasesParts.forEach(trainingPhrasesPart => {
    const part = {
      text: trainingPhrasesPart,
    };

    // Here we create a new training phrase for each provided part.
    const trainingPhrase = {
      type: 'EXAMPLE',
      parts: [part],
    };

    trainingPhrases.push(trainingPhrase);
  });

  const messageText = {
    text: messageTexts,
  };

  const message = {
    text: messageText,
  };
  
  const intent = {
    displayName: displayName,
    trainingPhrases: trainingPhrases,
    messages: [message],
  };

  const createIntentRequest = {
    parent: agentPath,
    intent: intent,
  };

  // Create the intent
  intentsClient
    .createIntent(createIntentRequest)
    .then(responses => {
      console.log(`Intent ${responses[0].name} created`);

      const newChatbot = new Chatbot({
        name: req.body.name,
        description: req.body.description,
        creatorTeacher: req.body.creatorTeacher,
        course: req.body.course
      })
      newChatbot.intentions.push(responses[0].name.split('/')[4])
      newChatbot.save((err, savedChatbot) => {
        console.log(savedChatbot)
        if (err) return res.status(500).json({ err })

        req.flash('success', { msg: `El Chatbot ha sido creado` });
        res.redirect('/profesor/chatbots')
      })
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

exports.getUpdateChatbot = (req, res) => {
  res.render('teacher/updateChatbot', {
    title: 'Actualizar chatbot'
  })
}

exports.postUpdateChatbot = (req, res) => {
  return res.send(req.body)
}

exports.getCreateCourse = (req, res) => {
  res.render('teacher/createCourse', {
    title: 'Crear curso'
  })   
}

exports.postCreateCourse = (req, res) => {
  // return res.send(req.body)
  const newCourse = new Course ({
    title: req.body.title,
    eap: req.body.eap,
    cycle: req.body.cycle,
    description: req.body.description,
    image: req.body.image,
    idTeacher: req.body.idTeacher
  })
  newCourse.save((err, createCourse) => {
    if (err) return res.status(500).json({ err })

    const newChatbot = new Chatbot({
      creatorTeacher: createCourse.idTeacher,
      course: createCourse._id
    })
    newChatbot.save((err, savedChatbot) => {
      console.log(savedChatbot)
      if (err) return res.status(500).json({ err })
        
      req.flash('success', { msg: `El curso ha sido creado` });
      res.redirect('/admin/cursos');
    })
  })
}