import { View, Text, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from 'types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from 'nativewind';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { processUrl } from '@/services/documentService';

const documentData = {
  "title": "Gramática básica: Los artículos",
  "content": "<div id=\"readability-page-1\" class=\"page\"><div id=\"lessoncontent\" data-title=\"Los artículos \"><p>/es/gramatica-basica/genero-y-numero-de-los-sustantivos/content/</p><h3>Los artículos</h3><p>Los <strong>artículos</strong> son <strong>palabras cortas</strong> que&nbsp;se encargan de definir el <a href=\"https://edu.gcfglobal.org/es/gramatica-basica/genero-y-numero-de-los-sustantivos/1/\" target=\"_blank\">género y número del sustantivo</a>. Además, hacen parte de la categoría gramatical de los <strong>determinantes</strong>.</p><p>En este video te los explicamos:&nbsp;</p><p><iframe src=\"https://www.youtube.com/embed/Ctx4hOgFzUQ?rel=0&amp;showinfo=0\" frameborder=\"0\" allowfullscreen=\"\"></iframe></p><p>Por ser tan cortos, los<strong> artículos</strong> muchas veces son llamados <strong>partículas</strong> que acompañan al sustantivo y te permiten saber si se refieren&nbsp;algo conocido o no.&nbsp;</p><p>En&nbsp;la siguiente tabla puedes ver cómo se clasifican los artículos:&nbsp;</p><p><img src=\"https://media.gcflearnfree.org/content/6303a31599e0c41ae06f67f5_08_22_2022/Los-arti%CC%81culos-en-grama%CC%81tica.png\" loading=\"lazy\" alt=\"Tabla de artículos, los artículos\" title=\"Tabla de artículos, los artículos\"></p><p><span>Los <strong>artículos </strong></span><span><strong>definidos&nbsp;</strong>se usan&nbsp;para acompañar un sustantivo que conoces o que puedes identificar. Por ejemplo:</span><br></p><ul><li><span><strong>La </strong>mujer</span></li><li><strong>El </strong>carro</li><li><strong>Los</strong> zapatos</li></ul><p>Los <strong>indefinidos&nbsp;</strong>acompañan sustantivos que no puedes identificar claramente, como:</p><ul><li><span><strong>Una</strong> casa</span></li><li><span><strong>Unos</strong> zapatos</span></li></ul><p><span>En este caso no estás señalando objetos puntuales, puede&nbsp;ser cualquier casa&nbsp; o cualquier par de zapatos.</span></p><p>El <strong>artículo neutro</strong> por su lado, se usa para referirse a&nbsp;sustantivos abstractos sin género alguno. Por ejemplo:&nbsp;</p><ul><li><strong>Lo</strong> mío es tuyo.</li><li>Está en la lista de <strong>lo</strong> que más me gusta.&nbsp;</li></ul><p><span>Allí entiendes que hablan de un objeto, pero nunca se sabe puntualmente de qué.&nbsp;</span></p><p>Como ves, una característica de los artículos es que siempre se ubican antes del sustantivo y te dan información sobre si este es masculino, femenino, singular o plural.&nbsp;</p><p>Si aún no tienes claros estos conceptos <a href=\"https://edu.gcfglobal.org/es/gramatica-basica/genero-y-numero-de-los-sustantivos/1/\" target=\"_blank\">haz clic aquí</a> para ver la lección <a href=\"https://edu.gcfglobal.org/es/gramatica-basica/genero-y-numero-de-los-sustantivos/1/\" target=\"_blank\">género y número de los sustantivos</a>.</p><p>En la siguiente página te explicamos<strong> otro tipo de determinantes</strong> que encuentras en la gramática de español. ¡No te los pierdas, son muy fáciles de aprender!</p><p>/es/gramatica-basica/demostrativos/content/</p></div></div>",
  "originalUrl": "https://edu.gcfglobal.org/es/gramatica-basica/los-articulos-/1/"
}

type HomeScreenNavigationProp = StackScreenProps<RootStackParamList, 'Main'>;
interface HomeScreenProps extends HomeScreenNavigationProp { }

export default function Home({ navigation }: HomeScreenProps) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [inputValue, setInputValue] = useState<string>("");
  const [isValidated, setIsValidated] = useState<boolean>(false);

  // 2. Nuevo estado para cargar
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit() {
    if (!isValidated) return;

    // 3. Iniciamos carga
    setIsLoading(true);

    try {
      // 4. Llamamos al servicio real (sin lógica sucia aquí)
      const data = await processUrl(inputValue);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: "Document processed successfully",
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 40
      });

      // 5. Navegamos con los datos reales
      navigation.navigate("Document", { data });

    } catch (error: any) {
      // Manejo de errores real
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to process URL',
        position: 'bottom',
        visibilityTime: 4000,
        bottomOffset: 40
      });
    } finally {
      // 6. Terminamos carga (pase lo que pase)
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4 pt-6">
      <ScrollView className="flex-1">
        <View className="flex-1">
          <Input
            type="url"
            placeholder="Enter a url"
            className="p-5"
            defaultValue={inputValue}
            onChangeText={(text) => setInputValue(text)}
            onValidationChange={(isValidated) => setIsValidated(isValidated)}
          />
          {
            inputValue.length > 0
              ? <Button
                variant="icon-only"
                disabled={!isValidated}
                onPress={handleSubmit}
                icon={<Feather name="search" size={18} color="#666" />}
                className="w-[40px] h-[40px] absolute right-2 top-2 items-center justify-center"
              />
              : <Button variant="icon-only" icon={<FontAwesome6 name="add" size={18} color="#666" />} className="w-[40px] h-[40px] absolute right-2 top-2 items-center justify-center" />
          }
        </View>

        <Card className="mt-6 items-center justify-center py-10">
          <Ionicons name="tablet-portrait" size={64} color="#a5a7ad" />
          <Text className="text-zinc-900 dark:text-zinc-100 text-lg">Recent documents is empty</Text>
          <Button
            title="Toggle Theme"
            onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
          />
        </Card>
      </ScrollView>
    </View>
  );
}