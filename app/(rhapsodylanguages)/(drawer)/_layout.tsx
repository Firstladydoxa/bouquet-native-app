import { SignOutButton } from "@/components/auth/SignOutButton";
import { SubscriptionProvider } from "@/contexts";
import { useThemeColors } from "@/hooks/use-themed-styles";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router, usePathname } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";


const CustomDrawerContent = (props: any) => {
  const pathname = usePathname();
  const colors = useThemeColors();

  useEffect(() => {
    console.log(pathname);
  }, [pathname]);

  const styles = StyleSheet.create({
    drawerStyle: {
      backgroundColor: colors.background,
    },
    navItem: {
      marginVertical: 8,
      marginHorizontal: 5
    },
    navItemLabel: {
      marginLeft: 5,
      fontSize: 16,
    },
    userInfoWrapper: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      paddingHorizontal: 10,
      paddingVertical: 20,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      marginBottom: 10,
    },
    userImg: {
      borderRadius: 40,
    },
    userDetailsWrapper: {
      marginTop: 25,
      marginLeft: 10,
    },
    userName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.white,
    },
    userEmail: {
      fontSize: 16,
      fontStyle: 'italic',
      textDecorationLine: 'underline',
      color: colors.white,
    },
    drawerContentContainer: {
      flex: 1,
    }
  });

  return (
    <View style={styles.drawerContentContainer}>
      <DrawerContentScrollView {...props} style={styles.drawerStyle}>

        <View style={styles.userInfoWrapper}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/26.jpg" }}
            width={80}
            height={80}
            style={styles.userImg}
          />
          <View style={styles.userDetailsWrapper}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john@email.com</Text>
          </View>
        </View>

      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name="home"
            size={30}
            color={colors.secondary}
          />
        )}
        label={"Home"}
        labelStyle={[
          styles.navItemLabel,
          { color: colors.text },
        ]}
        style={[
          styles.navItem,
          
        ]}
        onPress={() => {
          router.push("/(rhapsodylanguages)/(drawer)/(tabs)");
        }}
      />

      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name="person-circle"
            size={30}
            color={colors.secondary}
          />
        )}
        label={"Subscriptions"}
        labelStyle={[
          styles.navItemLabel,
          { color: colors.text },
        ]}
        style={[
          styles.navItem,   
        ]}
        onPress={() => {
          router.push("/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions");
        }}
      />
    

      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name="flag"
            size={30}
            color={colors.secondary}
          />
        )}
        label={"Languages by alphabet"}
        labelStyle={[
          styles.navItemLabel,
          { color: colors.text },
        ]}
        style={[styles.navItem,]}
        onPress={() => {
          router.push("/(rhapsodylanguages)/(drawer)/alphabet");
        }}
      />

      <DrawerItem
        label={"Languages by regions"}
        icon={({ color, size }) => (
          <Ionicons
            name="book"
            size={30}
            color={colors.secondary || colors.primary}
          />
        )}
        
        labelStyle={[
          styles.navItemLabel,
          { color: colors.text},
        ]}
        style={[ styles.navItem,]}
        onPress={() => {
          router.push("/regions/list");
        }}
      />
      
      </DrawerContentScrollView>
    </View>
  );
};


export default function DrawerLayout() {
  const colors = useThemeColors();
  
  return (
    <SubscriptionProvider>
      <Drawer 
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerTintColor: colors.white,
          headerTitle: 'Rhapsody Languages',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 20, color: colors.white },
          headerStyle: { backgroundColor: colors.primary },
          headerRight: () => <SignOutButton />,
        }}
      >
        <Drawer.Screen
          name="alphabet/index"
          options={{drawerLabel: 'By alphabet', title: 'Alphabet'}}
        />
        <Drawer.Screen
          name="regions/index"
          options={{drawerLabel: 'By region', title: 'Regions'}}
        />
      </Drawer>
    </SubscriptionProvider>
  );
}


// Styles are now created dynamically within the CustomDrawerContent component
