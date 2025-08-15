import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import { router } from 'expo-router';
import { MessageCircle, Heart, Bot as Lotus, Compass, MessageSquare, History } from 'lucide-react-native';

const examplePrompts = [
  {
    title: "Relationship Communication",
    text: "I'm having difficulty communicating with my partner during conflicts. How can I approach disagreements with more compassion?",
    icon: Heart
  },
  {
    title: "Career Decisions", 
    text: "I'm torn between staying in a secure job I dislike and pursuing my passion with financial uncertainty. What should guide my decision?",
    icon: Compass
  },
  {
    title: "Family Tensions",
    text: "My family has different values than me, leading to constant arguments. How can I maintain my beliefs while preserving family relationships?",
    icon: MessageSquare
  }
];

export default function HomeScreen() {
  const handleStartChat = (prompt?: string) => {
    if (prompt) {
      router.push({ pathname: '/chat', params: { initialPrompt: prompt } });
    } else {
      router.push('/chat');
    }
  };

  const handleViewHistory = () => {
    router.push('/conversations');
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Image source={require('../../assets/images/logo2.jpg')} style={styles.logoImage} />
        </View>
        <Text style={styles.title}>Lotus Guide</Text>
        <Text style={styles.subtitle}>
          Find peace and wisdom through Buddhist guidance for life's challenges
        </Text>
      </View>

      <View style={styles.welcomeSection}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Find peace in uncertainty</Text>
          <Text style={styles.welcomeText}>
            Share your situation in a few sentences, and receive compassionate guidance rooted in authentic Buddhist teachings.
          </Text>
        </View>
      </View>

      <View style={styles.examplesSection}>
        <Text style={styles.sectionTitle}>Example conversations</Text>
        
        {examplePrompts.map((prompt, index) => {
          const IconComponent = prompt.icon;
          return (
          <TouchableOpacity
            key={index}
            style={styles.exampleCard}
            onPress={() => handleStartChat(prompt.text)}
            activeOpacity={0.7}
          >
            <View style={styles.exampleHeader}>
              <View style={styles.exampleIconContainer}>
                <IconComponent size={20} color="#D4AF37" strokeWidth={1.5} />
              </View>
              <Text style={styles.exampleTitle}>{prompt.title}</Text>
            </View>
            <Text style={styles.exampleText}>{prompt.text}</Text>
          </TouchableOpacity>
        );
        })}
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => handleStartChat()}
        activeOpacity={0.8}
      >
        <MessageCircle size={20} color="#FEFEFE" strokeWidth={2} />
        <Text style={styles.startButtonText}>Start New Conversation</Text>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={handleViewHistory}
          activeOpacity={0.8}
        >
          <History size={20} color="#D4AF37" strokeWidth={2} />
          <Text style={styles.historyButtonText}>View Chat History</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  contentContainer: {
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#2C2C2C',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 15,
    color: '#5A5A5A',
    lineHeight: 22,
  },
  examplesSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  exampleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
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
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exampleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  exampleText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#D4AF37',
    marginHorizontal: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#FEFEFE',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historyButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});