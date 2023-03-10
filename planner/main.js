require('dotenv').config()
const fetch = require('node-fetch')
const express = require('express')

const port = process.env.PORT || 3000
const nbTasks = parseInt(process.env.TASKS) || 20

const randInt = (min, max) => Math.floor(Math.random() * (max - min)) + min
const taskType = () => (randInt(0, 2) ? 'mult' : 'add')
const args = () => ({ a: randInt(0, 40), b: randInt(0, 40) })

const generateTasks = (i) => {
  const tasks = []
  for (let j = 0; j < i; j++) {
    const task = {
      type: taskType(),
      args: args()
    }
    tasks.push(task)
  }
  return tasks
}

  let workers = [

    { url: 'http://worker:8080', id: '0' },
    { url: 'http://worker1:8081', id: '1' },

  ]


const app = express()
app.get('/', (req, res) => {

app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)

app.get('/', (req, res) => {
  res.send(JSON.stringify(workers))
})

app.post('/register', (req, res) => {
  const { url, id } = req.body
  const { url, id, add, mul } = req.body
  console.log(`Register: adding ${url} worker: ${id}`)
  workers.push({ url, id })
  workers.push({ url, id, add, mul })
  res.send('ok')
})

let tasks = generateTasks(nbTasks)
let taskToDo = nbTasks

const wait = (mili) =>
  new Promise((resolve, reject) => setTimeout(resolve, mili))

  const sendTask = async (worker, task) => {
    if (workers.length === 0 || tasks.length === 0) return
    console.log(`=> ${worker.url}/${task.type}`, task)
    if (worker.capabilities.includes(task.type)) {
      fetch(`${worker.url}/${task.type}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task.args),
      })
        .then((res) => {
          taskToDo -= 1
          console.log('---')
          console.log(nbTasks - taskToDo, '/', nbTasks, ':')
          console.log(task, 'has res', res)
          console.log('---')
          return res
        })
        .catch((err) => {
          console.error(task, ' failed', err.message)
          tasks = [...tasks, task]
        })
    }
  }
  
  

  const main = async () => {
    console.log(tasks)
    while (taskToDo > 0) {
      await wait(100)
      if (workers.length === 0 || tasks.length === 0) continue;
      for (let i = 0; i < workers.length; i++) {
        // V??rifier si les cap du worker correspondent ?? la t??che en cours d'ex??c
        if(workers[i].capabilities.includes(tasks[i % tasks.length].type)){
          sendTask(workers[i], tasks[i % tasks.length]);
        }
      }
    }
    console.log('end of tasks')
    server.close()
  }
  

const server = app.listen(port, () => {
  console.log(`Register listening at http://localhost:${port}`)
  console.log('starting tasks...')
  main()
})
