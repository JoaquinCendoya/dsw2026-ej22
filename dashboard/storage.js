const STORAGE_KEY = 'medportal-specialties';

export async function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    try {
      const response = await fetch('specialties.json');
      if (!response.ok) throw new Error('Error al cargar JSON');
      
      const data = await response.json();
      
      const formattedData = data.map(item => ({
        ...item,
        status: item.status || 'active'
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedData));
    } catch (error) {
      console.error('Error de inicialización:', error);
    }
  }
}

export function getSpecialties() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

export function saveSpecialty(specialty) {
  const specialties = getSpecialties();
  
  specialty.id = crypto.randomUUID(); 
  specialty.createdAt = new Date().toISOString();
  
  specialties.unshift(specialty);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(specialties));
  return specialty;
}
export function getFilteredSpecialties(searchTerm) {
  const allSpecialties = getSpecialties();
  if (!searchTerm) return allSpecialties;
  
  const lowerTerm = searchTerm.toLowerCase().trim();
  return allSpecialties.filter(specialty => 
    specialty.name.toLowerCase().includes(lowerTerm)
  );
}