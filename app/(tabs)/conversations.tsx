import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { MessageCircle, Plus, Trash2, Clock, Pin } from 'lucide-react-native';
import { useConversations } from '@/hooks/useConversations';

export default function ConversationsScreen() {
  const { conversations, isLoading, fetchConversations, deleteConversation } = useConversations();
  const [refreshing, setRefreshing] = useState(false);

  // Refresh conversations every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const handleStartNewChat = () => {
    router.push('/chat');
  };

  const handleOpenConversation = (conversationId: string) => {
    router.push({ 
      pathname: '/(tabs)/chat', 
      params: { conversationId } 
    });
  };

  const handleDeleteConversation = (conversationId: string, title: string) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteConversation(conversationId)
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Image source={require('../../assets/images/logo2.jpg')} style={styles.logoImage} />
            </View>
            <Text style={styles.headerTitle}>Conversations</Text>
          </View>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={handleStartNewChat}
            activeOpacity={0.7}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.conversationsList}
        contentContainerStyle={styles.conversationsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {conversations.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color="#D4AF37" strokeWidth={1.5} />
            <Text style={styles.emptyStateTitle}>No conversations yet</Text>
            <Text style={styles.emptyStateText}>
              Start your first conversation to receive Buddhist guidance and wisdom.
            </Text>
            <TouchableOpacity
              style={styles.startFirstChatButton}
              onPress={handleStartNewChat}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.startFirstChatButtonText}>Start First Chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationCard}
              onPress={() => handleOpenConversation(conversation.id)}
              activeOpacity={0.7}
            >
              <View style={styles.conversationHeader}>
                <View style={styles.conversationTitleContainer}>
                  {conversation.is_pinned && (
                    <Pin size={14} color="#D4AF37" strokeWidth={2} style={styles.pinIcon} />
                  )}
                  <Text style={styles.conversationTitle} numberOfLines={1}>
                    {conversation.title}
                  </Text>
                </View>
                <View style={styles.conversationMeta}>
                  <Text style={styles.conversationDate}>
                    {formatDate(conversation.last_message_at || conversation.created_at || '')}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteConversation(conversation.id, conversation.title)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color="#A0A0A0" strokeWidth={1.5} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {conversation.preview && (
                <Text style={styles.conversationPreview} numberOfLines={2}>
                  {conversation.preview}
                </Text>
              )}
              
              <View style={styles.conversationFooter}>
                <View style={styles.messageCount}>
                  <MessageCircle size={12} color="#A0A0A0" strokeWidth={1.5} />
                  <Text style={styles.messageCountText}>
                    {conversation.message_count || 0} messages
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  newChatButton: {
    backgroundColor: '#D4AF37',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    padding: 16,
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2C2C2C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  startFirstChatButton: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startFirstChatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  conversationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  conversationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  pinIcon: {
    marginRight: 6,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    flex: 1,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conversationDate: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  deleteButton: {
    padding: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
    marginBottom: 12,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageCountText: {
    fontSize: 12,
    color: '#A0A0A0',
    marginLeft: 4,
  },
});