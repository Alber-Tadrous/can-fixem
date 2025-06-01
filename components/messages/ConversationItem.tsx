import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Conversation } from '@/data/mockData';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export default function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: conversation.participant.avatar }} style={styles.avatar} />
        {conversation.participant.online && (
          <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]}>
            {conversation.participant.name}
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {conversation.lastMessageTime}
          </Text>
        </View>
        
        <View style={styles.messageContainer}>
          <Text 
            style={[styles.message, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {conversation.lastMessage}
          </Text>
          
          {conversation.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  time: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    flex: 1,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: 'white',
  },
});