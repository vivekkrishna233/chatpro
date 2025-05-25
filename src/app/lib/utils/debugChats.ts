// utils/debugChats.ts
import { createClient } from '@/app/lib/supabase/client'

const supabase = createClient()

// Debug function to test database connectivity and data
export async function debugChatsData() {
  console.log('🔍 Starting debug checks...')
  
  try {
    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔐 Auth Status:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      authError: authError?.message
    })
    
    if (!user) {
      console.log('❌ No authenticated user found')
      return
    }

    // 2. Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    console.log('👤 Profile Data:', {
      hasProfile: !!profile,
      fullName: profile?.full_name,
      profileError: profileError?.message
    })

    // 3. Check chat_participants
    const { data: participants, error: participantsError } = await supabase
      .from('chat_participants')
      .select('*')
      .eq('user_id', user.id)
    
    console.log('👥 Participants Data:', {
      count: participants?.length || 0,
      chatIds: participants?.map(p => p.chat_id) || [],
      participantsError: participantsError?.message
    })

    // 4. Check chats table
    const { data: allChats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(5)
    
    console.log('💬 Chats Table Sample:', {
      totalSample: allChats?.length || 0,
      firstChat: allChats?.[0],
      chatsError: chatsError?.message
    })

    // 5. If user has chat participants, check their chats
    if (participants && participants.length > 0) {
      const chatIds = participants.map(p => p.chat_id)
      const { data: userChats, error: userChatsError } = await supabase
        .from('chats')
        .select('*')
        .in('id', chatIds)
      
      console.log('💬 User Chats:', {
        count: userChats?.length || 0,
        chats: userChats?.map(chat => ({
          id: chat.id,
          name: chat.name,
          type: chat.chat_type
        })),
        userChatsError: userChatsError?.message
      })

      // 6. Check messages for first chat
      if (userChats && userChats.length > 0) {
        const firstChatId = userChats[0].id
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', firstChatId)
          .limit(3)
        
        console.log('📨 Messages Sample:', {
          chatId: firstChatId,
          count: messages?.length || 0,
          messages: messages?.map(msg => ({
            id: msg.id,
            content: msg.content?.substring(0, 50) + '...',
            sender: msg.sender_name,
            created_at: msg.created_at
          })),
          messagesError: messagesError?.message
        })
      }
    }

    // 7. Test a simple direct query that should work
    const { data: simpleTest, error: simpleError } = await supabase
      .from('chat_participants')
      .select(`
        chat_id,
        chats (
          id,
          name,
          chat_type
        )
      `)
      .eq('user_id', user.id)
      .limit(1)
    
    console.log('🧪 Simple Join Test:', {
      hasData: !!simpleTest && simpleTest.length > 0,
      data: simpleTest,
      simpleError: simpleError?.message
    })

    console.log('✅ Debug checks completed')
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

// Function to manually test the getChats function
export async function testGetChats() {
  console.log('🧪 Testing getChats function...')
  
  try {
    // Import the function dynamically to avoid circular imports
    const { getChats } = await import('@/app/services/chatService')
    const chats = await getChats()
    
    console.log('✅ getChats test result:', {
      success: true,
      count: chats.length,
      chats: chats.map(chat => ({
        id: chat.id,
        name: chat.name,
        type: chat.chatType,
      }))
    })
    
    return chats
  } catch (error) {
    console.error('❌ getChats test failed:', error)
    throw error
  }
}

// You can call this in your component for debugging
export function useDebugChats() {
  const runDebug = async () => {
    await debugChatsData()
    await testGetChats()
  }
  
  return { runDebug }
}