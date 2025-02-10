export async function getCategoriesFn({
    skip = 0,
    limit = 10,
    search
  }: {
    skip?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const params = new URLSearchParams();
    params.set('skip', skip.toString());
    params.set('limit', limit.toString());
  
    if (search) {
      params.set('search', search);
    }
    
    const res = await fetch(`/api/categories?${params.toString()}`);
    if (!res.ok) {
      console.error('Error fetching categories:', res);
      throw new Error('Failed to fetch categories');
    }
    return await res.json();
  }
  
  type NewCategory = {
    name: string;
  };
  
  export async function createCategoryFn(newCategory: NewCategory) {
    const { name } = newCategory;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
  
      if (!res.ok) {
        throw new Error('Failed to create category');
      }
      return await res.json();
    } catch (err) {
      console.error(err);
    }
  }
  
  export async function deleteCategoryFn(id: number) {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!res.ok) {
        throw new Error('Failed to delete category');
      }
    } catch (err) {
      console.error(err);
    }
  }
  
  type UpdateCategoryTypes = {
    id: number;
    name: string;
  };
  
  export async function updateCategoryFn({
    id,
    name
  }: UpdateCategoryTypes) {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
  
      if (!res.ok) {
        throw new Error('Failed to update category');
      }
      return await res.json();
    } catch (err) {
      console.error(err);
    }
  }
  
  export async function getSingleCategoryFn(id: string) {
    const res = await fetch(`/api/categories/${id}`);
    if (!res.ok) {
      console.error('Error fetching category:', res);
      throw new Error('Failed to fetch category');
    }
    return await res.json();
  }
  