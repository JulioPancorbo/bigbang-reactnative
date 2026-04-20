# HTML/CSS → React Native + NativeWind Mapping Reference

Complete mapping table for converting Stitch HTML exports to React Native components with NativeWind styling.

---

## Element Mapping

| HTML Element | React Native Component | Import From | Notes |
|---|---|---|---|
| `<div>` | `<View>` | `react-native` | Default container |
| `<main>` | `<View>` | `react-native` | Semantic → plain View |
| `<header>` | `<View>` | `react-native` | Semantic → plain View |
| `<footer>` | `<View>` | `react-native` | Semantic → plain View |
| `<section>` | `<View>` | `react-native` | Semantic → plain View |
| `<nav>` | `<View>` | `react-native` | Semantic → plain View |
| `<p>` | `<Text>` | `react-native` | All text must be in `<Text>` |
| `<span>` | `<Text>` | `react-native` | Inline text → `<Text>` |
| `<h1>`–`<h6>` | `<Text>` | `react-native` | Use className for size/weight |
| `<a>` | `<TouchableOpacity>` wrapping `<Text>` | `react-native` | With `onPress` navigation |
| `<label>` | `<Text>` | `react-native` | Form labels → `<Text>` |
| `<input type="text">` | `<TextInput>` | `react-native` | Add `placeholder`, `className` |
| `<input type="email">` | `<TextInput>` | `react-native` | Add `keyboardType="email-address"` `autoCapitalize="none"` |
| `<input type="password">` | `<TextInput>` | `react-native` | Add `secureTextEntry` |
| `<input type="number">` | `<TextInput>` | `react-native` | Add `keyboardType="numeric"` |
| `<input type="tel">` | `<TextInput>` | `react-native` | Add `keyboardType="phone-pad"` |
| `<textarea>` | `<TextInput>` | `react-native` | Add `multiline numberOfLines={4}` |
| `<button>` | `<TouchableOpacity>` | `react-native` | Wrap content in `<Text>` for label |
| `<img>` | `<Image>` | `expo-image` | `source={{ uri: '...' }}` |
| `<form>` | — (remove) | — | Logic handled by `useFormState` hook |
| `<ul>`, `<ol>` | `<View>` or `<FlatList>` | `react-native` | FlatList if 3+ repeated items |
| `<li>` | `<View>` | `react-native` | List item container |
| `<hr>` | `<View>` | `react-native` | `className="h-px bg-gray-200"` |
| `<br>` | — (remove) | — | Use spacing/margin instead |

---

## Attribute Mapping

| HTML Attribute | RN Prop | Notes |
|---|---|---|
| `class="..."` | `className="..."` | Direct transfer for Tailwind classes |
| `placeholder="..."` | `placeholder="..."` | Same prop name |
| `type="password"` | `secureTextEntry` | Boolean prop |
| `type="email"` | `keyboardType="email-address"` | Plus `autoCapitalize="none"` |
| `type="submit"` | — (remove) | Button is `<TouchableOpacity onPress={handleSubmit}>` |
| `href="#"` | `onPress={() => navigation.navigate('...')}` | Replace with navigation |
| `alt="..."` | `accessibilityLabel="..."` | Accessibility mapping |
| `data-alt="..."` | — (ignore) | Stitch AI image prompt, use for TODO-assets.md |
| `data-icon="..."` | — (ignore) | Stitch icon identifier |
| `src="..."` | `source={{ uri: '...' }}` | For `<Image>` component |
| `style="..."` | `className="..."` | Convert inline styles to Tailwind classes |

---

## CSS/Tailwind Class Mapping

### Classes that transfer directly (NativeWind supported)

These Tailwind classes work the same in NativeWind — keep them as-is:

**Layout:** `flex`, `flex-1`, `flex-row`, `flex-col`, `flex-wrap`, `items-center`, `justify-center`, `justify-between`, `justify-end`, `self-center`, `self-start`, `self-end`

**Spacing:** `p-*`, `px-*`, `py-*`, `pt-*`, `pb-*`, `pl-*`, `pr-*`, `m-*`, `mx-*`, `my-*`, `mt-*`, `mb-*`, `ml-*`, `mr-*`, `gap-*`, `space-x-*`, `space-y-*`

**Sizing:** `w-full`, `w-1/2`, `w-1/3`, `h-*`, `w-*` (with Tailwind units)

**Typography:** `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `font-normal`, `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`, `text-center`, `text-left`, `text-right`, `leading-*`, `tracking-*`, `uppercase`, `lowercase`, `capitalize`

**Colors:** `text-{color}`, `bg-{color}`, `border-{color}` (all custom tokens from tailwind.config)

**Borders:** `border`, `border-*`, `border-t`, `border-b`, `rounded-*`, `rounded-t-*`, `rounded-b-*`, `rounded-l-*`, `rounded-r-*`, `rounded-full`

**Opacity:** `opacity-*`, `bg-{color}/{opacity}` (e.g. `bg-primary/10`)

**Overflow:** `overflow-hidden`

**Position:** `relative`, `absolute`, `top-*`, `bottom-*`, `left-*`, `right-*`, `z-*`

**Display:** `hidden`

**Shadow:** `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg` (limited on Android)

### Classes that need transformation

| Web Tailwind | NativeWind Equivalent | Notes |
|---|---|---|
| `min-h-screen` | `flex-1` | Screens are full height by default |
| `max-w-md` | *(remove)* | Mobile is always full width |
| `max-w-[480px]` | *(remove)* | Mobile is always full width |
| `w-screen` | `w-full` | |
| `h-screen` | `flex-1` or *(remove)* | |
| `grid grid-cols-2` | `flex-row flex-wrap` + `w-1/2` on children | No CSS grid in RN |
| `grid grid-cols-3` | `flex-row flex-wrap` + `w-1/3` on children | |
| `cursor-pointer` | *(remove)* | No cursor on mobile |
| `select-none` | *(remove)* | |
| `overflow-x-auto` | Use `<ScrollView horizontal>` | |
| `overflow-y-auto` | Use `<ScrollView>` | |
| `fixed` | `absolute` | In RN, `fixed` doesn't exist |
| `sticky` | *(remove or use stickyHeaderIndices)* | |
| `inline`, `inline-block` | *(remove)* | Use `<Text>` nesting or flex |
| `block` | *(remove)* | Default in RN |

### Classes to REMOVE (no RN equivalent)

```
hover:*           focus:*           active:scale-*
transition-*      duration-*        ease-*
animate-*         backdrop-blur-*   blur-*
cursor-*          select-*          selection:*
underline-offset-* ring-*           outline-*
focus-within:*    focus-visible:*   group-hover:*
placeholder:*     @container        scroll-smooth
snap-*            will-change-*     appearance-*
```

---

## Layout Pattern Mapping

### Full-screen layout with header + content + footer

**Stitch HTML:**
```html
<body class="flex flex-col min-h-screen">
  <header class="px-6 pt-16 pb-10">...</header>
  <main class="flex-1 px-4 pb-12">...</main>
  <footer class="mt-auto pb-10 text-center">...</footer>
</body>
```

**React Native:**
```tsx
<SafeAreaView className="flex-1 bg-background">
  <View className="px-6 pt-4 pb-4">{/* header */}</View>
  <ScrollView className="flex-1 px-4">{/* main */}</ScrollView>
  <View className="pb-6 items-center">{/* footer */}</View>
</SafeAreaView>
```

### Centered content (Welcome/Login screens)

**Stitch HTML:**
```html
<main class="flex-grow flex flex-col items-center justify-between px-8 pt-20 pb-12 max-w-md mx-auto">
  <div class="text-center space-y-12">...</div>
  <div class="w-full space-y-3">...</div>
</main>
```

**React Native:**
```tsx
<SafeAreaView className="flex-1 bg-background">
  <View className="flex-1 justify-between px-8 pt-12 pb-8">
    <View className="items-center">{/* top content */}</View>
    <View className="w-full gap-3">{/* bottom actions */}</View>
  </View>
</SafeAreaView>
```

### Form with keyboard avoidance

**Stitch HTML:**
```html
<form class="space-y-5">
  <div class="space-y-2">
    <label>...</label>
    <input class="w-full h-14 bg-input-light rounded-2xl px-5" />
  </div>
  <button class="w-full h-14 bg-primary rounded-2xl" type="submit">Sign In</button>
</form>
```

**React Native:**
```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
    <View className="gap-5">
      <View className="gap-2">
        <Text className="text-sm font-semibold ml-1">Label</Text>
        <TextInput
          className="w-full h-14 bg-input-light rounded-2xl px-5"
          placeholder="..."
          value={values.field}
          onChangeText={(v) => handleChange('field', v)}
        />
      </View>
      <Button label="Sign In" onPress={handleSubmit} disabled={loading} />
    </View>
  </ScrollView>
</KeyboardAvoidingView>
```

### Horizontal scroll list

**Stitch HTML:**
```html
<div class="overflow-x-auto flex space-x-4 px-6">
  <div class="flex-shrink-0 w-64">Card 1</div>
  <div class="flex-shrink-0 w-64">Card 2</div>
</div>
```

**React Native:**
```tsx
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
>
  <View className="w-64">{/* Card 1 */}</View>
  <View className="w-64">{/* Card 2 */}</View>
</ScrollView>
```

### Divider with text

**Stitch HTML:**
```html
<div class="relative my-8">
  <div class="absolute inset-0 flex items-center">
    <div class="w-full border-t border-warm-gray/10"></div>
  </div>
  <div class="relative flex justify-center text-xs uppercase">
    <span class="bg-white px-2 text-warm-gray/50">Or continue with</span>
  </div>
</div>
```

**React Native:**
```tsx
<View className="flex-row items-center my-8">
  <View className="flex-1 h-px bg-warm-gray/10" />
  <Text className="px-2 text-xs uppercase text-warm-gray/50">Or continue with</Text>
  <View className="flex-1 h-px bg-warm-gray/10" />
</View>
```

### Social login buttons row

**Stitch HTML:**
```html
<div class="flex gap-4">
  <button class="flex-1 h-12 border border-warm-gray/10 rounded-2xl">Google</button>
  <button class="flex-1 h-12 border border-warm-gray/10 rounded-2xl">Apple</button>
</div>
```

**React Native:**
```tsx
<View className="flex-row gap-4">
  <TouchableOpacity className="flex-1 h-12 border border-warm-gray/10 rounded-2xl items-center justify-center">
    <Ionicons name="logo-google" size={20} color="#3A312B" />
  </TouchableOpacity>
  <TouchableOpacity className="flex-1 h-12 border border-warm-gray/10 rounded-2xl items-center justify-center">
    <Ionicons name="logo-apple" size={20} color="#3A312B" />
  </TouchableOpacity>
</View>
```

---

## Repeated Elements → FlatList Heuristic

If the HTML contains **3 or more sibling elements** with identical structure (same tag, same classes, different content), convert to `FlatList`:

**Stitch HTML (repeated pattern):**
```html
<div class="space-y-4">
  <div class="flex-row bg-white rounded-3xl p-3 shadow-sm">
    <img class="w-24 h-24 rounded-2xl" src="..." />
    <div class="flex-1"><h3>Title 1</h3><p>Subtitle 1</p></div>
  </div>
  <div class="flex-row bg-white rounded-3xl p-3 shadow-sm">
    <img class="w-24 h-24 rounded-2xl" src="..." />
    <div class="flex-1"><h3>Title 2</h3><p>Subtitle 2</p></div>
  </div>
  <!-- 2+ more identical structures -->
</div>
```

**React Native:**
```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  contentContainerStyle={{ gap: 16 }}
  renderItem={({ item }) => (
    <TouchableOpacity className="flex-row bg-white rounded-3xl p-3 shadow-sm">
      <Image source={{ uri: item.image }} className="w-24 h-24 rounded-2xl" />
      <View className="flex-1 ml-4">
        <Text className="text-lg font-bold">{item.title}</Text>
        <Text className="text-warm-gray">{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  )}
/>
```
