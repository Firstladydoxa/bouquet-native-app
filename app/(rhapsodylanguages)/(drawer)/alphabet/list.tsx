import CustomLoader from '@/components/ui/CustomLoader';
import { useAuth } from '@/contexts';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { RhapsodyLanguagesAPI } from '@/services/rhapsodylanguagesApi';
import type { CountryData } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';



export default function LanguagesByAlphabetScreenSample() {
    const { user } = useAuth();
    const colors = useThemeColors();
    const { region } = useLocalSearchParams<{ region: string }>();

    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [countries, setCountries] = useState<CountryData[]>([]);

    // Check authentication
    useEffect(() => {
        if (!user) {
            router.replace('/(auth)/sign-in');
            return;
        }
    }, [user]);


    const loadData = async () => {
        try {
            setLoading(true);
    
            const [countriesList] = await Promise.all([
                RhapsodyLanguagesAPI.fetchCountriesByRegion(region),
            ]);

            if (countriesList) {
                setCountries(countriesList);
            }
    
        } catch (error) {
            console.log("Error loading the data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
       
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        // await sleep(2000);
        await loadData();
        setRefreshing(false);
    };

    if (loading && !refreshing) return <CustomLoader message="Loading..." size="large" />;

    // Show authentication error if user is not signed in
    if (!user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: colors.background }}>
                <Ionicons name="lock-closed-outline" size={64} color="#ccc" />
                <Text style={{ fontSize: 18, textAlign: 'center', color: '#666', marginVertical: 24 }}>
                    Please sign in to access alphabetical language listing
                </Text>
                <TouchableOpacity 
                    style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 }}
                    onPress={() => router.replace('/(auth)/sign-in')}
                >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
          <Text>Alphabetical List</Text>
          <Text style={{ color: colors.text, marginTop: 20 }}>
            Available for authenticated users with active subscription
          </Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  regionsCardCol: {
    width: 280,
    height: 200,
    maxHeight: 200,
    marginHorizontal: 'auto',
    marginVertical: 10
  },
  regionsCardImage: {
    width: '100%',
    height: '100%',
    marginRight: '100%',
  },
});