// src/data/store.js

const seededAt = new Date().toISOString()

let nextId = 6

const birds = [
  {
    id: 1,
    common_name: 'Great Kiskadee',
    scientific_name: 'Pitangus sulphuratus',
    family: 'Tyrannidae',
    description: 'A large, boldly marked flycatcher with a booming "kis-ka-dee" call, common in South Texas and Latin America.',
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 2,
    common_name: 'Plain Chachalaca',
    scientific_name: 'Ortalis vetula',
    family: 'Cracidae',
    description: 'A gregarious, turkey-like bird of dense thickets, known for its raucous chorus at dawn. A South Texas specialty.',
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 3,
    common_name: 'Black-bellied Whistling-Duck',
    scientific_name: 'Dendrocygna autumnalis',
    family: 'Anatidae',
    description: null,
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 4,
    common_name: 'Red-crowned Amazon',
    scientific_name: 'Amazona viridigenalis',
    family: 'Psittacidae',
    description: 'An endangered parrot native to northeastern Mexico, with established feral populations in South Texas cities.',
    created_at: seededAt,
    updated_at: seededAt,
  },
  {
    id: 5,
    common_name: 'Golden-fronted Woodpecker',
    scientific_name: 'Melanerpes aurifrons',
    family: 'Picidae',
    description: null,
    created_at: seededAt,
    updated_at: seededAt,
  },
]

export function getAllBirds() {
  return birds
}

export function getBirdById(id) {
  return birds.find((b) => b.id === id) ?? null
}

export function createBird(input) {
  const now = new Date().toISOString()
  const bird = {
    id: nextId++,
    common_name: input.common_name,
    scientific_name: input.scientific_name ?? null,
    family: input.family ?? null,
    description: input.description ?? null,
    created_at: now,
    updated_at: now,
  }
  birds.push(bird)
  return bird
}

export function updateBird(id, input) {
  const bird = birds.find((b) => b.id === id)
  if (!bird) return null
  if ('common_name' in input) bird.common_name = input.common_name
  if ('scientific_name' in input) bird.scientific_name = input.scientific_name
  if ('family' in input) bird.family = input.family
  if ('description' in input) bird.description = input.description
  bird.updated_at = new Date().toISOString()
  return bird
}

export function deleteBird(id) {
  const index = birds.findIndex((b) => b.id === id)
  if (index === -1) return false
  birds.splice(index, 1)
  return true
}