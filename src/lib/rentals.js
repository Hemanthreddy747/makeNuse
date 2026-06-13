import { supabase } from './supabaseClient'

export async function fetchProperties(userId) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
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
    .select('*, property:property_id(name), floor:floor_id(name), room:room_id(name), rent_type:rent_type_id(*)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchPersonsWithRooms(userId) {
  const { data, error } = await supabase
    .from('persons')
    .select('*, property:property_id(name), floor:floor_id(name), room:room_id(name), rent_type:rent_type_id(*)')
    .eq('user_id', userId)
    .not('room_id', 'is', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchPersonsPaginated({ userId, hasRoom, page = 0, pageSize = 50, sortBy = 'move_in_date', sortDir = 'desc', search = '' }) {
  const baseQuery = supabase
    .from('persons')
    .select('*, property:property_id(name), floor:floor_id(name), room:room_id(name), rent_type:rent_type_id(*)', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_active', true)
    .neq('name', '')

  if (hasRoom === true) {
    baseQuery.not('room_id', 'is', null)
  } else if (hasRoom === false) {
    baseQuery.is('room_id', null)
  }

  if (search) {
    baseQuery.ilike('name', `%${search}%`)
  }

  const { data, error, count } = await baseQuery
    .order(sortBy, { ascending: sortDir === 'asc', nullsLast: true })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) throw error
  return { data, count }
}

export async function fetchFormerPersons(userId) {
  const { data, error } = await supabase
    .from('persons')
    .select('*, property:property_id(name), floor:floor_id(name), room:room_id(name), rent_type:rent_type_id(*)')
    .eq('user_id', userId)
    .eq('is_active', false)
    .order('move_out_date', { ascending: false })
  if (error) throw error
  return data
}

export async function createPerson({ userId, propertyId, name, phone, email, roomNo, moveInDate, floorId, roomId, rentType, rentAmount, rentDueDay, rentTypeId }) {
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
      rent_type: rentType || 'monthly',
      rent_amount: rentAmount || null,
      rent_due_day: rentDueDay || null,
      rent_type_id: rentTypeId || null,
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

export async function permanentlyDeletePerson(id) {
  const { error } = await supabase.from('persons').delete().eq('id', id)
  if (error) throw error
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

export async function fetchRentsByPerson(personId) {
  const { data, error } = await supabase
    .from('rents')
    .select('*, person:person_id(name), property:property_id(name)')
    .eq('person_id', personId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
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

/* ── Rent Obligations (Enterprise) ───── */

export async function fetchRentObligations(userId) {
  const { data, error } = await supabase
    .from('rent_obligations')
    .select('*, person:person_id(name), property:property_id(name), payments:rent_payments(*)')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchRentObligationsByPerson(personId) {
  const { data, error } = await supabase
    .from('rent_obligations')
    .select('*, person:person_id(name), property:property_id(name), payments:rent_payments(*)')
    .eq('person_id', personId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
  if (error) throw error
  return data
}

export async function createRentObligation({ userId, personId, propertyId, amount, dueDate, periodStart, periodEnd, month, year, status, notes }) {
  const { data, error } = await supabase
    .from('rent_obligations')
    .insert({
      user_id: userId,
      person_id: personId,
      property_id: propertyId,
      amount,
      due_date: dueDate,
      period_start: periodStart || null,
      period_end: periodEnd || null,
      month,
      year,
      status: status || 'pending',
      notes: notes || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRentObligation(id, fields) {
  const { data, error } = await supabase
    .from('rent_obligations')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cancelRentObligation(id) {
  const { data, error } = await supabase
    .from('rent_obligations')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/* ── Rent Payments (Enterprise) ──────── */

export async function createRentPayment({ obligationId, personId, propertyId, amount, paymentDate, paymentMethod, referenceNumber, notes }) {
  const { data, error } = await supabase
    .from('rent_payments')
    .insert({
      obligation_id: obligationId,
      person_id: personId,
      property_id: propertyId || null,
      amount,
      payment_date: paymentDate || new Date().toISOString(),
      payment_method: paymentMethod || null,
      reference_number: referenceNumber || null,
      notes: notes || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchRentPaymentsByObligation(obligationId) {
  const { data, error } = await supabase
    .from('rent_payments')
    .select('*')
    .eq('obligation_id', obligationId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchRentPaymentsByPerson(personId) {
  const { data, error } = await supabase
    .from('rent_payments')
    .select('*, obligation:obligation_id(*)')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function deleteRentPayment(id) {
  const { error } = await supabase.from('rent_payments').delete().eq('id', id)
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
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

/* ── Tree data (property → floors → rooms → persons) ── */

export async function fetchPropertyTree(userId, propertyId) {
  const { data: persons, error: perr } = await supabase
    .from('persons')
    .select('*, rent_type:rent_type_id(*)')
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

/* ── Rent Types ──────────────────────── */

const DEFAULT_RENT_TYPES = [
  { name: '1 day', type: 'daily', amount: 400 },
  { name: '15 days', type: 'weekly', amount: 4800 },
  { name: '2 days', type: 'daily', amount: 800 },
  { name: 'monthly 2 share', type: 'monthly', amount: 10000 },
  { name: 'monthly 3 share', type: 'monthly', amount: 8500 },
  { name: 'monthly 4 share', type: 'monthly', amount: 8000 },
  { name: 'weekly', type: 'weekly', amount: 2500 },
]

export async function fetchRentTypes(userId) {
  const { data, error } = await supabase
    .from('rent_types')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function seedDefaultRentTypes(userId) {
  const records = DEFAULT_RENT_TYPES.map(rt => ({
    user_id: userId,
    name: rt.name,
    type: rt.type,
    amount: rt.amount,
  }))
  const { error } = await supabase
    .from('rent_types')
    .upsert(records, { onConflict: 'user_id,name', ignoreDuplicates: true })
  if (error) throw error
}

export async function createRentType({ userId, name, type, amount, dueDay }) {
  const { data, error } = await supabase
    .from('rent_types')
    .insert({ user_id: userId, name, type: type || 'monthly', amount: amount || null, due_day: dueDay || null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRentType(id, fields) {
  const { data, error } = await supabase
    .from('rent_types')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRentType(id) {
  const { error } = await supabase.from('rent_types').delete().eq('id', id)
  if (error) throw error
}

/* ── Person Documents ────────────────── */

export async function fetchPersonDocuments(personId) {
  const { data, error } = await supabase
    .from('person_documents')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function uploadPersonDocument({ userId, personId, file }) {
  const ext = file.name.split('.').pop()
  const filePath = `${userId}/${personId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('person-documents')
    .upload(filePath, file)
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('person_documents')
    .insert({
      person_id: personId,
      user_id: userId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type || null,
    })
    .select()
    .single()
  if (error) {
    await supabase.storage.from('person-documents').remove([filePath])
    throw error
  }
  return data
}

export async function deletePersonDocument(id, filePath) {
  await supabase.storage.from('person-documents').remove([filePath])
  const { error } = await supabase.from('person_documents').delete().eq('id', id)
  if (error) throw error
}

export async function getPersonDocumentUrl(filePath) {
  const { data, error } = await supabase.storage.from('person-documents').createSignedUrl(filePath, 60)
  if (error) throw error
  return data.signedUrl
}
