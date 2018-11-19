
const User = require('../models/User');
const Course = require('../models/Course');
const Group = require('../models/Group')
const Chatbot = require('../models/Chatbot');
const CredentialsAgent = require('../models/CredentialsAgent');

// const projectId = process.env.DFPROJECT_ID;
// const client_email = process.env.DFCLIENT_EMAIL;
// const private_key = process.env.DFPRIVATE_KEY;
// const sessionId = 'quickstart-session-id';



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
  Chatbot
  .find({ creatorTeacher: req.user._id })
  .populate('course')
  .sort({createdAt: -1})
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
  Chatbot
  .findById(req.params.id)
  .exec((err, chatbot) => {
    if (err) return res.status(500).json({ err })

    const sessionId = 'quickstart-session-id';
    const projectId = chatbot.credentials.projectId;
    const credentials = {
      credentials: {
        client_email: chatbot.credentials.clientEmail,
        private_key: chatbot.credentials.privateKey
      },
      projectId: chatbot.credentials.projectId
    }
    
    const intentsClient = new dialogflow.IntentsClient(credentials);
    const projectAgentPath = intentsClient.projectAgentPath(projectId, sessionId);
  
    const request = {
      parent: projectAgentPath,
      intentView: 'INTENT_VIEW_FULL'
    };
  
    let intenciones = [];
    intentsClient
      .listIntents(request)
      .then(responses => {
        console.log(responses[0])
        responses[0].forEach(intent => {
          chatbot.intentions.forEach(id => {
            if (intent.name.split('/')[4] == id) {
              intenciones.push({
                idI: intent.name.split('/')[4],
                displayName: intent.displayName
              })
            }
          })
        });
        res.render('teacher/chatbot', {
          title: 'Detalle Chatbot',
          chatbot,
          intenciones
        })
      })
      .catch(err => {
        console.error('Error al enumerar intenciones:', err);
        res.redirect('back');
      });
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

  const displayName = req.body.nombreIntencion;
  const trainingPhrasesParts = req.body.preguntas;
  const messageTexts = req.body.respuestas;
  const trainingPhrases = [];

  //creando las frases o preguntas para la intención y luego lo guardamos en el array
  trainingPhrasesParts.forEach(trainingPhrasesPart => {
    const part = {
      text: trainingPhrasesPart,
    };
    const trainingPhrase = {
      type: 'EXAMPLE',
      parts: [part],
    };
    trainingPhrases.push(trainingPhrase);
  });

  //creando las respuesta para la intencion
  const messageText = {
    text: messageTexts,
  };
  const message = {
    text: messageText,
  };

  //definiendo el objeto intencion
  const intent = {
    displayName: displayName,
    trainingPhrases: trainingPhrases,
    messages: [message],
  };

  //definiendo el objeto para la creacion de la intencion
  const createIntentRequest = {
    parent: agentPath,
    intent: intent,
  };

  // Create the intent
  intentsClient
    .createIntent(createIntentRequest)
    .then(responses => {
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
      res.redirect('back');
    });
}

exports.getUpdateChatbot = (req, res) => {
  Chatbot
  .findById(req.params.id)
  .populate('course')
  .exec((err, chatbot) => {
    if (err) return res.status(500).json({ err })
    console.log(chatbot)
    res.render('teacher/updateChatbot', {
      title: 'Actualizar chatbot',
      chatbot
    })
  })
}

exports.postUpdateChatbot = (req, res) => {
  Chatbot
  .findById(req.params.id)
  .exec((err, chatbot0) => {
    if (err) return res.status(500).json({ err })

    const responses = req.body.respuestas;
  
    const filesUrl = [];
    req.files.map((f) => filesUrl.push(f.location));
  
    const resFile = responses.map((r, f) => {
      return r + '\n\n Archivo: ' + filesUrl[f]
    })

    const sessionId = 'quickstart-session-id';
    const projectId = chatbot0.credentials.projectId;
    const credentials = {
      credentials: {
        client_email: chatbot0.credentials.clientEmail,
        private_key: chatbot0.credentials.privateKey
      },
      projectId: chatbot0.credentials.projectId
    }
  
    const intentsClient = new dialogflow.IntentsClient(credentials);
    const agentPath = intentsClient.projectAgentPath(projectId, sessionId);
  
    const displayName = req.body.nombreIntencion;
    const trainingPhrasesParts = req.body.preguntas;
    const messageTexts = resFile;
    const trainingPhrases = [];
  
    //creando las frases o preguntas para la intención y luego lo guardamos en el array
    trainingPhrasesParts.forEach(trainingPhrasesPart => {
      const part = {
        text: trainingPhrasesPart,
      };
      const trainingPhrase = {
        type: 'EXAMPLE',
        parts: [part],
      };
      trainingPhrases.push(trainingPhrase);
    });
  
    //creando las respuesta para la intencion
    const messageText = {
      text: messageTexts,
    };
    const message = {
      text: messageText,
    };
  
    //definiendo el objeto intencion
    const intent = {
      displayName: displayName,
      trainingPhrases: trainingPhrases,
      messages: [message],
    };
  
    //definiendo el objeto para la creacion de la intencion
    const createIntentRequest = {
      parent: agentPath,
      intent: intent,
    };
  
    // Create the intent
    if (displayName) {usePushEach: true
      intentsClient
        .createIntent(createIntentRequest)
        .then(responses => {
          Chatbot
          .findById(chatbot0._id)
          .exec((err, chatbot) => {
            if (err) return res.status(500).json({ err })
            chatbot.name = req.body.name || chatbot.name;
            chatbot.description = req.body.description || chatbot.description;
            chatbot.intentions.push(responses[0].name.split('/')[4]);
  
            chatbot.save((err, editChatbot) => {
              console.log(editChatbot)
              if (err) return res.status(500).json({ err })
              req.flash('success', { msg: `El Chatbot ha sido actualizado` });
              res.redirect('/profesor/chatbots')
            })
          })
        })
        .catch(err => {
          console.error('ERROR:', err);
          res.redirect('back');
        });
    }
    else {
      Chatbot
      .findById(chatbot0._id)
      .exec((err, chatbot) => {
        if (err) return res.status(500).json({ err })
        chatbot.name = req.body.name || chatbot.name;
        chatbot.description = req.body.description || chatbot.description;
  
        chatbot.save((err, editChatbot) => {
          console.log(editChatbot)
          if (err) return res.status(500).json({ err })
          req.flash('success', { msg: `El Chatbot ha sido actualizado` });
          res.redirect('/profesor/chatbots')
        })
      })
    }
  })  
  
}

exports.getCreateCourse = (req, res) => {
  res.render('teacher/createCourse', {
    title: 'Crear curso'
  })
}

exports.postCreateCourse = (req, res) => {
  // return res.send(req.body)
  CredentialsAgent
  .find()
  .exec((err, credential) => {
    if (err) return res.status(500).json({err})

    if (credential.length > 0) {

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
          course: createCourse._id,
          credentials: {
            projectId: credential[0].projectId,
            clientEmail: credential[0].clientEmail,
            privateKey: credential[0].privateKey
          }
        })
        newChatbot.save((err, savedChatbot) => {
          console.log(savedChatbot)
          if (err) return res.status(500).json({ err })
    
          newCourse.idChatbot = savedChatbot._id
          newCourse.save((err) => {
            if (err) return res.status(500).json({ err })
            
            CredentialsAgent
            .findById(credential[0]._id)
            .remove()
            .exec((err) => {
              if (err) return res.status(500).json({ err })
              
              req.flash('success', { msg: `El curso ha sido creado` });
              res.redirect('/profesor/cursos');
            })
          })
        })
      })
    }
    else {
      req.flash('success', { msg: `Ya no puede crear mas cursos, contactese con el administrador de la web` });
      res.redirect('back')
    }
  })
}

exports.getUpdateChatbotInfo = (req, res) => {
  Chatbot
  .findById(req.params.id)
  .exec((err, chatbot) => {
    if (err) return res.status(500).json({ err })
    console.log(chatbot)
    res.render('teacher/updateChatbotInfo', {
      title: 'Actualizar chatbot',
      chatbot
    })
  })
}

exports.postUpdateChatbotInfo = (req, res) => {
  Chatbot
  .findById(req.params.id)
  .exec((err, chatbot) => {
    if (err) return res.status(500).json({ err })
    chatbot.name = req.body.name || chatbot.name;
    chatbot.description = req.body.description || chatbot.description;

    chatbot.save((err, editChatbot) => {
      if (err) return res.status(500).json({ err })
      req.flash('success', { msg: `El Chatbot ha sido actualizado` });
      res.redirect('/profesor/chatbots/'+req.params.id)
    })
  })
}

exports.getCreateIntention = (req, res) => {
  Chatbot
  .findById(req.params.id)
  .exec((err, chatbot) => {
    if (err) return res.status(500).json({ err })
    res.render('teacher/createIntention', {
      title: 'Crear intención',
      chatbot
    })
  })
}

exports.postCreateIntention = (req, res) => {

  Chatbot
  .findById(req.params.id)
  .exec((err, chatbot0) => {
    if (err) return res.status(500).json({ err })

    const responses = req.body.respuestas;
  
    const filesUrl = [];
    req.files.map((f) => {filesUrl.push(f.location)})

    const resFile = responses.map((r, f) => {
      
      if (filesUrl[f] == undefined) {
        return r + '\n\n Archivo: ' + ''
      } 
      else {
        return r + '\n\n Archivo: ' + filesUrl[f]
      }
    })
  
    const sessionId = 'quickstart-session-id';
    const projectId = chatbot0.credentials.projectId;
    const credentials = {
      credentials: {
        client_email: chatbot0.credentials.clientEmail,
        private_key: chatbot0.credentials.privateKey
      },
      projectId: chatbot0.credentials.projectId
    }

    const intentsClient = new dialogflow.IntentsClient(credentials);
    const agentPath = intentsClient.projectAgentPath(projectId, sessionId);
  
    const displayName = req.body.nombreIntencion;
    const trainingPhrasesParts = req.body.preguntas;
    const messageTexts = resFile;
    const trainingPhrases = [];
  
    //creando las frases o preguntas para la intención y luego lo guardamos en el array
    trainingPhrasesParts.forEach(trainingPhrasesPart => {
      const part = {
        text: trainingPhrasesPart,
      };
      const trainingPhrase = {
        type: 'EXAMPLE',
        parts: [part],
      };
      trainingPhrases.push(trainingPhrase);
    });
  
    //creando las respuesta para la intencion
    const messageText = {
      text: messageTexts,
    };
    const message = {
      text: messageText,
    };
  
    //definiendo el objeto intencion
    const intent = {
      displayName: displayName,
      trainingPhrases: trainingPhrases,
      messages: [message],
    };
  
    //definiendo el objeto para la creacion de la intencion
    const createIntentRequest = {
      parent: agentPath,
      intent: intent,
    };
  
    // Create the intent
    if (displayName) {
      intentsClient
        .createIntent(createIntentRequest)
        .then(responses => {
          Chatbot
          .findById(req.params.id)
          .exec((err, chatbot) => {
            if (err) return res.status(500).json({ err })
            chatbot.intentions.push(responses[0].name.split('/')[4]);
  
            chatbot.save((err, editChatbot) => {
              console.log(editChatbot)
              if (err) return res.status(500).json({ err })
              req.flash('success', { msg: `Se ha creado intenciones para el chatbot correctamente.` });
              res.redirect('/profesor/chatbots/'+req.params.id)
            })
          })
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    }
  })  
}

exports.getUpdateIntention = (req, res) => {
  
  Chatbot
  .findById(req.params.id)
  .exec((err, chatbot) => {
    if (err) return res.status(500).json({ err })

    const sessionId = 'quickstart-session-id';
    const projectId = chatbot.credentials.projectId;
    const credentials = {
      credentials: {
        client_email: chatbot.credentials.clientEmail,
        private_key: chatbot.credentials.privateKey
      },
      projectId: chatbot.credentials.projectId
    }

    const intentsClient = new dialogflow.IntentsClient(credentials);
    const projectAgentPath = intentsClient.projectAgentPath(projectId, sessionId);
  
    const request = {
      parent: projectAgentPath,
      intentView: 'INTENT_VIEW_FULL'
    };
  
    let intencion = {};
    intentsClient
      .listIntents(request)
      .then(responses => {
        responses[0].forEach(intent => {
          if (intent.name.split('/')[4] == req.params.idI) {
            intencion.idI = intent.name.split('/')[4];
            intencion.displayName = intent.displayName;
            intencion.preguntas = JSON.parse(JSON.stringify(intent.trainingPhrases));
            intencion.respuestas = JSON.parse(JSON.stringify(intent.messages));
          }
        });
        console.log(intencion.respuestas[0].text.text)
        res.render('teacher/updateIntention', {
          title: 'Editar intención',
          chatbot,
          intencion
        })
      })
      .catch(err => {
        console.error('Error al enumerar intenciones:', err);
        res.redirect('back');
      });
  })
}

exports.postUpdateIntention = (req, res) => {
  const responses = req.body.respuestas;
  const archivoCreado = req.body.archivoCreado;

  const resFile = responses.map((r, f) => {
    return r + '\n\n Archivo: ' + archivoCreado[f]
  })

  const intentId = req.params.idI

  Chatbot
  .findById(req.params.id)
  .exec((err, chatbot) => {
    if (err) return res.status(500).json({ err })

    var intenciones = chatbot.intentions
    intenciones.splice(intenciones.indexOf(intentId), 1)

    chatbot.save((err) => {
      if (err) return res.status(500).json({ err })

      const sessionId = 'quickstart-session-id';
      const projectId = chatbot.credentials.projectId;
      const credentials = {
        credentials: {
          client_email: chatbot.credentials.clientEmail,
          private_key: chatbot.credentials.privateKey
        },
        projectId: chatbot.credentials.projectId
      }
      const intentsClient = new dialogflow.IntentsClient(credentials);
      const intentPath = intentsClient.intentPath(projectId, intentId);

      const request = {name: intentPath};

      intentsClient
        .deleteIntent(request)
        .then(respuesta => {
          console.log(`La intencion ${intentPath} ha sido eliminada.`)

          const agentPath = intentsClient.projectAgentPath(projectId, sessionId);

          const displayName = req.body.nombreIntencion;
          const trainingPhrasesParts = req.body.preguntas;
          const messageTexts = resFile;
          const trainingPhrases = [];

          //creando las frases o preguntas para la intención y luego lo guardamos en el array
          trainingPhrasesParts.forEach(trainingPhrasesPart => {
            const part = {
              text: trainingPhrasesPart,
            };
            const trainingPhrase = {
              type: 'EXAMPLE',
              parts: [part],
            };
            trainingPhrases.push(trainingPhrase);
          });

          //creando las respuesta para la intencion
          const messageText = {
            text: messageTexts,
          };
          const message = {
            text: messageText,
          };

          //definiendo el objeto intencion
          const intent = {
            displayName: displayName,
            trainingPhrases: trainingPhrases,
            messages: [message],
          };

          //definiendo el objeto para la creacion de la intencion
          const createIntentRequest = {
            parent: agentPath,
            intent: intent,
          };

          if (displayName) {
            intentsClient
              .createIntent(createIntentRequest)
              .then(responses => {
                Chatbot
                .findById(chatbot._id)
                .exec((err, chatbot2) => {
                  if (err) return res.status(500).json({ err })
                  chatbot2.intentions.push(responses[0].name.split('/')[4]);

                  chatbot2.save((err, editChatbot) => {
                    console.log(editChatbot)
                    if (err) return res.status(500).json({ err })
                    req.flash('success', { msg: `Se ha actualizado la intención del chatbot correctamente.` });
                    res.redirect('/profesor/chatbots/'+editChatbot._id)
                  })
                })
              })
              .catch(err => {
                console.error('ERROR:', err);
                res.redirect('back');
              });
          }
        })
        .catch(err => {
          console.error(`Failed to delete intent ${intentPath}:`, err);
          res.redirect('back');
        });
    })
  })
}

exports.getChatbotChat = (req, res) => {
  Chatbot
  .findById(req.params.id)
  .exec((err, chatbot) => {
    if (err) return res.status(500).json({ err })
    res.render('teacher/courseChatbot', {
      title: 'Conversar con chatbot',
      chatbot
    })
  })
}