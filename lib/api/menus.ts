export async function getMenusFn({
    skip = 0,
    limit = 10,
    search,
    categoryId,
  }: {
    skip?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
  } = {}) {
    const params = new URLSearchParams();
    params.set('skip', skip.toString());
    params.set('limit', limit.toString());
    if (search) {
      params.set('search', search);
    }
    if (categoryId !== undefined) {
      params.set('categoryId', categoryId.toString());
    }
  
    const res = await fetch(`/api/menus?${params.toString()}`);
    if (!res.ok) {
      console.error('Error fetching menus:', res);
      throw new Error('Failed to fetch menus');
    }
    return await res.json();
  }
  
  export type NewMenu = {
    name: string;
    desc: string;
    price: number;
    categoryId: number;
    pic: File; 
  };
  
  export async function createMenuFn(newMenu: NewMenu) {
    const formData = new FormData();
    formData.append('name', newMenu.name);
    formData.append('desc', newMenu.desc);
    formData.append('price', newMenu.price.toString());
    formData.append('categoryId', newMenu.categoryId.toString());
    formData.append('pic', newMenu.pic);
  
    const res = await fetch('/api/menus', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error('Failed to create menu');
    }
    return await res.json();
  }
  
  export type UpdateMenu = {
    id: number;
    name: string;
    desc: string;
    price: number;
    categoryId: number;
    pic?: File; 
  };
  
  export async function updateMenuFn({
    id,
    name,
    desc,
    price,
    categoryId,
    pic,
  }: UpdateMenu) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('desc', desc);
    formData.append('price', price.toString());
    formData.append('categoryId', categoryId.toString());
    if (pic) {
      formData.append('pic', pic);
    }
  
    const res = await fetch(`/api/menus/${id}`, {
      method: 'PATCH',
      body: formData,
    });
    if (!res.ok) {
      throw new Error('Failed to update menu');
    }
    return await res.json();
  }
  
  export async function deleteMenuFn(id: number) {
    const res = await fetch(`/api/menus/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error('Failed to delete menu');
    }
  }
  
  export async function getSingleMenuFn(id: string) {
    const res = await fetch(`/api/menus/${id}`);
    if (!res.ok) {
      console.error('Error fetching menu:', res);
      throw new Error('Failed to fetch menu');
    }
    return await res.json();
  }
  