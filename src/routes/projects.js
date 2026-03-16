import { Hono } from 'hono'
import { listProjects, getProjectById, createProject } from '../data/store.js'
import { parseJsonBody } from '../utils/body.js'
import { ApiError } from '../utils/errors.js'
import { sendCollection, sendResource } from '../utils/response.js'
import { parseIdParam, validateProjectCreate } from '../utils/validation.js'

const projects = new Hono()

projects.get('/', (c) => {
  const data = listProjects()
  return sendCollection(c, data)
})

projects.post('/', async (c) => {
  const payload = await parseJsonBody(c)
  const details = validateProjectCreate(payload)

  if (details.length > 0) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      'Some fields are invalid.',
      details,
    )
  }

  const project = createProject(payload)
  c.header('Location', `/api/projects/${project.id}`)
  return sendResource(c, project, 201)
})

projects.get('/:id', (c) => {
  const id = parseIdParam(c.req.param('id'))

  const project = getProjectById(id)

  if (!project) {
    throw new ApiError(404, 'NOT_FOUND', 'Project not found.')
  }

  return sendResource(c, project)
})

export default projects