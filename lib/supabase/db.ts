// /lib/supabase/db.ts
import { supabase } from './client'

// Types
export type DbChat = {
  id: string
  title: string
  initial_prompt: string
  created_at: string
}

export type DbMessage = {
  id: string
  chat_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

export type DbCodeBlock = {
  id: string
  chat_id: string
  message_id: string
  filename: string
  extension: string
  content: string
  language: string
  created_at: string
}

export type DbUserCredit = {
  id: string
  user_id: string
  email: string
  balance: number
  created_at: string
  updated_at: string
}

// Chat operations
export async function createChat(title: string, initial_prompt: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('User must be logged in to create a chat')
  }
  const { data, error } = await supabase
    .from('chats')
    .insert({ title, initial_prompt, user_id: user.id  })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getChat(chatId: string) {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      messages!chat_id(id, content, role, created_at),
      code_blocks(*)
    `)
    .eq('id', chatId)
    .order('created_at', { ascending: true, foreignTable: 'messages' })
    .single()
    
  if (error) throw error
  console.log('Chat data:', data);  // Debug log
  return data
}

// Message operations
// Message operations
export async function addMessage(chatId: string, content: string, role: 'user' | 'assistant') {
  console.log('=== addMessage called ===');
  console.log('Input:', { chatId, content, role });
  
  const { data, error } = await supabase
    .from('messages')
    .insert({ chat_id: chatId, content, role })
    .select()
    .single();
    
  if (error) {
    console.error('Error in addMessage:', error);
    throw error;
  }
  
  console.log('Added message:', data);
  return data;
}

export async function getMessages(chatId: string) {
  console.log('=== getMessages called ===');
  console.log('Fetching for chatId:', chatId);
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error in getMessages:', error);
    throw error;
  }
  
  console.log('Total messages found:', data?.length);
  console.log('Messages:', data);
  return data;
}

// Code block operations
export async function addCodeBlock(
  chatId: string,
  messageId: string,
  filename: string,
  extension: string,
  content: string,
  language: string
) {
  const { data, error } = await supabase
    .from('code_blocks')
    .insert({
      chat_id: chatId,
      message_id: messageId,
      filename,
      extension,
      content,
      language
    })
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function getCodeBlocks(chatId: string) {
  const { data, error } = await supabase
    .from('code_blocks')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// Batch operations for stream completion
export async function saveStreamCompletion(
  chatId: string, 
  messageContent: string, 
  codeBlocks: Array<{
    filename: string,
    extension: string,
    content: string,
    language: string
  }>
) {
  // First insert the message
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({ 
      chat_id: chatId, 
      content: messageContent, 
      role: 'assistant' 
    })
    .select()
    .single()

  if (messageError) throw messageError

  // Then insert all code blocks
  if (codeBlocks.length > 0) {
    const { error: codeError } = await supabase
      .from('code_blocks')
      .insert(
        codeBlocks.map(block => ({
          chat_id: chatId,
          message_id: message.id,
          ...block
        }))
      )

    if (codeError) throw codeError
  }

  return message
}

// In db.ts

export async function checkUserCredit(userId: string) {
  const { data, error } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single();
    
  if (error) throw error;
  return data?.balance > 0;
}

// In db.ts
export async function initializeUserCredit(userId: string, email: string) {
  // First check if record exists
  const { data: existing } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();  // Use maybeSingle() instead of single()

  if (existing) {
    // Record already exists, just return it
    return existing;
  }

  // Only try to insert if record doesn't exist
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        email: email,
        balance: 0
      })
      .select()
      .single();

    if (error) {
      // If we get a duplicate key error, it means another concurrent request created the record
      // Just ignore this error and try to fetch the record again
      if (error.code === '23505') {
        const { data: retryData } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', userId)
          .single();
        return retryData;
      }
      throw error;
    }

    return data;
  } catch (error: any) {
    // If it's not a duplicate key error, rethrow it
    if (error.code !== '23505') {
      throw error;
    }
    // For duplicate key errors, try one final time to get the record
    const { data: finalData } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();
    return finalData;
  }
}

export async function deductUserCredit(userId: string) {
  // First get current balance
  const { data: creditData, error: fetchError } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single();
    
  if (fetchError) throw fetchError;
  if (!creditData || creditData.balance <= 0) {
    throw new Error('Insufficient credits');
  }

  // Then update with new balance
  const { data, error } = await supabase
    .from('user_credits')
    .update({ 
      balance: creditData.balance - 1,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}