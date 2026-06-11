import { supabase } from './supabaseClient'

export async function fetchProperties(userId) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createProperty({ userId, name, type, address, latitude, longitude }) {
  const { data, error } = await supabase
    .from('properties')
    .insert({ user_id: userId, name, type, address, latitude, longitude })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProperty(id, fields) {
  const { data, error } = await supabase
    .from('properties')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProperty(id) {
  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw error
}

export async function fetchPersons(userId) {
  const { data, error } = await supabase
    .from('persons')
    .select('*, property:property_id(name), floor:floor_id(name), room:room_id(name)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchFormerPersons(userId) {
  const { data, error } = await supabase
    .from('persons')
    .select('*, property:property_id(name), floor:floor_id(name), room:room_id(name)')
    .eq('user_id', userId)
    .eq('is_active', false)
    .order('move_out_date', { ascending: false })
  if (error) throw error
  return data
}

export async function createPerson({ userId, propertyId, name, phone, email, roomNo, moveInDate, floorId, roomId }) {
  const { data, error } = await supabase
    .from('persons')
    .insert({
      user_id: userId,
      property_id: propertyId || null,
      name,
      phone: phone || '',
      email: email || '',
      room_no: roomNo || '',
      move_in_date: moveInDate || null,
      floor_id: floorId || null,
      room_id: roomId || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePerson(id, fields) {
  const { data, error } = await supabase
    .from('persons')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePerson(id) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('persons')
    .update({ is_active: false, move_out_date: today })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchRents(userId) {
  const { data, error } = await supabase
    .from('rents')
    .select('*, person:person_id(name), property:property_id(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createRent({ userId, personId, propertyId, amount, dueDate, paidDate, status, month, year }) {
  const { data, error } = await supabase
    .from('rents')
    .insert({
      user_id: userId,
      person_id: personId,
      property_id: propertyId,
      amount,
      due_date: dueDate,
      paid_date: paidDate || null,
      status: status || 'pending',
      month,
      year,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRent(id, fields) {
  const { data, error } = await supabase
    .from('rents')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRent(id) {
  const { error } = await supabase.from('rents').delete().eq('id', id)
  if (error) throw error
}

/* ── Floors ──────────────────────────── */

export async function fetchFloors(userId, propertyId) {
  const { data, error } = await supabase
    .from('floors')
    .select('*')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function createFloor({ userId, propertyId, name }) {
  const { data, error } = await supabase
    .from('floors')
    .insert({ user_id: userId, property_id: propertyId, name })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFloor(id, fields) {
  const { data, error } = await supabase
    .from('floors')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFloor(id) {
  const { error } = await supabase.from('floors').delete().eq('id', id)
  if (error) throw error
}

/* ── Rooms ───────────────────────────── */

export async function fetchRooms(userId, propertyId) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function createRoom({ userId, propertyId, floorId, name }) {
  const { data, error } = await supabase
    .from('rooms')
    .insert({ user_id: userId, property_id: propertyId, floor_id: floorId, name })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRoom(id, fields) {
  const { data, error } = await supabase
    .from('rooms')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRoom(id) {
  const { error } = await supabase.from('rooms').delete().eq('id', id)
  if (error) throw error
}

export async function fetchAllFloors(userId) {
  const { data, error } = await supabase
    .from('floors')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchAllRooms(userId) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

/* ── Tree data (property → floors → rooms → persons) ── */

export async function fetchPropertyTree(userId, propertyId) {
  const { data: persons, error: perr } = await supabase
    .from('persons')
    .select('*')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .order('name', { ascending: true })
  if (perr) throw perr

  const [floors, rooms] = await Promise.all([
    fetchFloors(userId, propertyId),
    fetchRooms(userId, propertyId),
  ])

  return { floors, rooms, persons }
}
