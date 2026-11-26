import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const ITEM_HEIGHT = 56;

/**
 * Vertical snap-wheel picker matching the onboarding selector screens (age, height, weight).
 */
export default function WheelPicker({ items, selectedValue, onValueChange, formatLabel, width = '100%' }) {
  const scrollRef = useRef(null);
  const selectedIndex = Math.max(0, items.indexOf(selectedValue));

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
    }, 30);
    return () => clearTimeout(timer);
  }, [selectedIndex, items.length]);

  const handleScrollEnd = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(items.length - 1, Math.round(offsetY / ITEM_HEIGHT)));
    if (items[idx] !== undefined && items[idx] !== selectedValue) {
      onValueChange(items[idx]);
    }
  };

  const selectIndex = (idx) => {
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    if (items[clamped] !== undefined) {
      onValueChange(items[clamped]);
    }
  };

  return (
    <View style={[wheelStyles.container, { width }]}>
      <View pointerEvents="none" style={wheelStyles.highlightBox} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
      >
        {items.map((item, idx) => {
          const isSelected = item === selectedValue;
          const label = formatLabel ? formatLabel(item) : String(item);
          return (
            <TouchableOpacity
              key={`${label}-${idx}`}
              activeOpacity={0.75}
              onPress={() => selectIndex(idx)}
              style={wheelStyles.itemRow}
            >
              <Text style={[wheelStyles.itemText, isSelected && wheelStyles.itemTextSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const wheelStyles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * 3,
    position: 'relative',
    overflow: 'hidden'
  },
  highlightBox: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    backgroundColor: 'rgba(14, 30, 54, 0.55)'
  },
  itemRow: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemText: {
    fontSize: 21,
    fontWeight: '600',
    color: '#64748B'
  },
  itemTextSelected: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC'
  }
});
