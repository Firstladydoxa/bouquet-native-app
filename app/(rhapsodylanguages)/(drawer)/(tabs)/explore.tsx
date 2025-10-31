import CustomLoader from '@/components/ui/CustomLoader';
import type { ThemeColors } from '@/constants/colors';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { RhapsodyLanguagesAPI } from '@/services/rhapsodylanguagesApi';
import type { Region } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const PlaceholderImage = require('@/assets/images/react-logo.png');
const mediathekURL = 'https://mediathek.tniglobal.org';

export default function LanguagesByRegionScreen() {

  const colors = useThemeColors();
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);

  const styles = createStyles(colors);


  const loadRegions = async () => {
    try {
        setLoading(true);
  
        const [regionsList] = await Promise.all([
          RhapsodyLanguagesAPI.fetchRegions(),
        ]);
        if (regionsList) {
          setRegions(regionsList);
        }
  
    } catch (error) {
      console.log("Error loading the data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRegions();
    setRefreshing(false);
  };

  const renderRegionCard = ({ item }: { item: Region }) => {
    const imageSource = item.file_name 
      ? { uri: `${mediathekURL}/images/${item.file_name}` }
      : PlaceholderImage;

    return (
      <TouchableOpacity
        style={styles.regionCard}
        activeOpacity={0.8}
        onPress={() => router.push(`/regions/${item.value}` as any)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={imageSource}
            style={styles.regionImage}
            contentFit="cover"
            transition={300}
            placeholder={PlaceholderImage}
          />
          <View style={styles.overlay} />
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.regionTitle} numberOfLines={2}>
              {item.label}
            </Text>
            <View style={styles.iconContainer}>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={colors.primary} 
              />
            </View>
          </View>
          <Text style={styles.regionDescription} numberOfLines={1}>
            Explore languages in {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) return <CustomLoader message="Loading regions..." size="large" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Languages by regions and countries</Text>
        <Text style={styles.headerSubtitle}>
          Search a language by region:
        </Text>
      </View>
      
      <FlatList
        data={regions}
        keyExtractor={({ id }) => id}
        renderItem={renderRegionCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'BerkshireSwash_400Regular',
    color: colors.tertiary || '#3847d6',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  regionCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  regionImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  regionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    backgroundColor: colors.primary + '15',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    fontWeight: '600',
  },
});