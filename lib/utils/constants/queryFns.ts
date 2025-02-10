export async function getTodosFn({ skip = 0, limit = 10 } = {}) {
  const res = await fetch(`/api/todos?skip=${skip}&limit=${limit}`)
  if (!res.ok) {
    console.error('Error fetching todos:', res)
    throw new Error('Failed to fetch todos')
  }
  return await res.json()
}

type NewTodo = {
  title: string
  importance: string
}

export async function createTodoFn(newTodo: NewTodo) {
  const { title, importance } = newTodo
  try {
    const res = await fetch('api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, importance })
    })

    if (!res.ok) {
      throw new Error('Failed to create todo')
    }

    // Deletion was successful, redirect the home page
  } catch (err) {
    console.error(err)
  }
}

export async function deleteTodoFn(id: number) {
  try {
    const res = await fetch(`api/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      throw new Error('Failed to delete todo')
    }

    // Deletion was successful, redirect the home page
  } catch (err) {
    console.error(err)
  }
}

type UpdateTodoTypes = {
  id: number
  title: string
  importance: string
  complete: boolean
}

export async function updateTodoFn({
  id,
  title,
  importance,
  complete
}: UpdateTodoTypes) {
  try {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        importance,
        complete
      })
    })

    if (!res.ok) {
      throw new Error('Failed to update todo')
    }
  } catch (err) {
    console.error(err)
  }
}

export async function getSingleTodoFn(id: string) {
  const res = await fetch(`/api/todos/${id}`)

  if (!res.ok) {
    console.log(res)
  }

  return await res.json()
}

export async function getUsersFn({ skip = 0, limit = 10 } = {}) {
  const res = await fetch(`/api/users?skip=${skip}&limit=${limit}`)
  if (!res.ok) {
    console.error('Error fetching users:', res)
    throw new Error('Failed to fetch users')
  }
  return await res.json()
}
