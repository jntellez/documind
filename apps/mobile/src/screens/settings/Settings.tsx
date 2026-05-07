import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useUiTheme } from "@/theme/useUiTheme";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import {
  SettingsAboutSection,
  SettingsAccountSection,
  SettingsAppearanceSection,
  SettingsDataSection,
  SettingsReadingSection,
} from "./SettingsSections";
import { useSettingsActions } from "./useSettingsActions";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { useDocumentPreferences } from "@/context/DocumentPreferencesContext";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";

export default function Settings() {
  const { toggleColorScheme } = useColorScheme();
  const theme = useUiTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { handleLogin, handleLogout, handleClearCache } = useSettingsActions();
  const [isHeaderShown, setIsHeaderShown] = useState(true);
  const lastScrollYRef = useRef(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: isHeaderShown,
    });
  }, [isHeaderShown, navigation]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = Math.max(0, event.nativeEvent.contentOffset.y);
    const delta = y - lastScrollYRef.current;
    const threshold = 8;
    const topThreshold = 4;

    if (y <= topThreshold) {
      setIsHeaderShown((current) => (current ? current : true));
      lastScrollYRef.current = y;
      return;
    }

    if (Math.abs(delta) >= threshold) {
      if (delta > 0 && y > 0) {
        setIsHeaderShown((current) => (current ? false : current));
      } else {
        setIsHeaderShown((current) => (current ? current : true));
      }
    }

    lastScrollYRef.current = y;
  }, []);

  const {
    showImagesInDetail,
    setShowImagesInDetail,
    documentContentFontSize,
    setDocumentContentFontSize,
  } = useDocumentPreferences();

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1 pt-30"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <SettingsAccountSection user={user} onLogin={handleLogin} />
        <SettingsAppearanceSection
          theme={theme}
          onToggleTheme={toggleColorScheme}
        />
        <SettingsReadingSection
          showImagesInDetail={showImagesInDetail}
          onToggleShowImagesInDetail={() => setShowImagesInDetail(!showImagesInDetail)}
          documentContentFontSize={documentContentFontSize}
          onChangeDocumentContentFontSize={setDocumentContentFontSize}
        />
        {user && (
          <SettingsDataSection
            onClearCache={handleClearCache}
          />
        )}
        <SettingsAboutSection />

        {user && (
          <Button
            onPress={handleLogout}
            title="Logout"
            variant="icon"
            icon={<Icon library="ionicons" name="log-out-outline" size="lg" />}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
