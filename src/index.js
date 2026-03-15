import { Hono } from 'hono'
import projects from './routes/projects.js'

const app = new Hono()
const api = new Hono()

api.route('/projects', projects)

app.route('/api', api)

export default app