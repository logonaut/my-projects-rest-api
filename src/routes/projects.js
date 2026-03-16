import { Hono } from 'hono'
import { listProjects, getProjectById } from '../data/store.js'
import { ApiError } from '../utils/errors.js'
import { sendCollection, sendResource } from '../utils/response.js'

const projects = new Hono()

projects.get('/', (c) => {
  const data = listProjects()
  return sendCollection(c, data)
})

projects.get('/:id', (c) => {
  const id = +c.req.param('id')   // temporary — we'll replace with parseIdParam next

  const project = getProjectById(id)

  if (!project) {
    throw new ApiError(404, 'NOT_FOUND', 'Project not found.')
  }

  return sendResource(c, project)
})

export default projects