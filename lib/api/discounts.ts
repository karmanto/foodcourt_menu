export async function getDiscountsFn({
  skip = 0,
  limit = 10,
  month,
  year,
  search
}: {
  skip?: number;
  limit?: number;
  month?: number;
  year?: number;
  search?: string;
} = {}) {
  const params = new URLSearchParams();
  params.set('skip', skip.toString());
  params.set('limit', limit.toString());

  if (month !== undefined) {
    params.set('month', month.toString());
  }
  if (year !== undefined) {
    params.set('year', year.toString());
  }
  if (search) {
    params.set('search', search);
  }
  
  const res = await fetch(`/api/discounts?${params.toString()}`);
  if (!res.ok) {
    console.error('Error fetching discounts:', res);
    throw new Error('Failed to fetch discounts');
  }
  return await res.json();
}

type NewDiscount = {
  name: string
  value: number
  startPeriod: string
  endPeriod: string
}

export async function createDiscountFn(newDiscount: NewDiscount) {
  const { name, value, startPeriod, endPeriod } = newDiscount
  try {
    const res = await fetch('/api/discounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, value, startPeriod, endPeriod })
    })

    if (!res.ok) {
      throw new Error('Failed to create discount')
    }

    return await res.json()
  } catch (err) {
    console.error(err)
  }
}

export async function deleteDiscountFn(id: number) {
  try {
    const res = await fetch(`/api/discounts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      throw new Error('Failed to delete discount')
    }
  } catch (err) {
    console.error(err)
  }
}

type UpdateDiscountTypes = {
  id: number
  name: string
  value: number
  startPeriod: string
  endPeriod: string
}

export async function updateDiscountFn({
  id,
  name,
  value,
  startPeriod,
  endPeriod
}: UpdateDiscountTypes) {
  try {
    const res = await fetch(`/api/discounts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        value,
        startPeriod,
        endPeriod
      })
    })

    if (!res.ok) {
      throw new Error('Failed to update discount')
    }

    return await res.json()
  } catch (err) {
    console.error(err)
  }
}

export async function getSingleDiscountFn(id: string) {
  const res = await fetch(`/api/discounts/${id}`)

  if (!res.ok) {
    console.error('Error fetching discount:', res)
    throw new Error('Failed to fetch discount')
  }

  return await res.json()
}
