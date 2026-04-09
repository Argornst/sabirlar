import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  filterProductionProductOptions,
  normalizeProductOptions,
} from "../../domain/entities/productionProduct.entity";

function resolveInitialValue({ value, defaultValue, options }) {
  const baseValue =
    value !== undefined && value !== null ? value : defaultValue || "";

  const matchedOption = options.find((option) => option.value === baseValue);

  return {
    inputValue: matchedOption?.label || baseValue || "",
    selectedValue: baseValue || "",
  };
}

export default function ProductAutocomplete({
  name,
  value,
  defaultValue = "",
  onChange,
  onBlur,
  placeholder = "Ürün seçin veya yazın",
  disabled = false,
  error = "",
  options = [],
  allowManualEntry = true,
  emptyMessage = "Sonuç bulunamadı",
  hint = "Yazdıkça ürünler filtrelenir",
  className = "",
}) {
  const instanceId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = `${instanceId}-listbox`;

  const normalizedOptions = useMemo(
    () => normalizeProductOptions(options),
    [options]
  );

  const isControlled = value !== undefined;

  const initialState = useMemo(
    () =>
      resolveInitialValue({
        value,
        defaultValue,
        options: normalizedOptions,
      }),
    [value, defaultValue, normalizedOptions]
  );

  const [inputValue, setInputValue] = useState(initialState.inputValue);
  const [selectedValue, setSelectedValue] = useState(initialState.selectedValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasFocus, setHasFocus] = useState(false);

  useEffect(() => {
    if (!isControlled) return;

    const nextState = resolveInitialValue({
      value,
      defaultValue,
      options: normalizedOptions,
    });

    setInputValue(nextState.inputValue);
    setSelectedValue(nextState.selectedValue);
  }, [isControlled, value, defaultValue, normalizedOptions]);

  const filteredOptions = useMemo(
    () => filterProductionProductOptions(normalizedOptions, inputValue),
    [normalizedOptions, inputValue]
  );

  const canShowManualOption =
    allowManualEntry &&
    inputValue.trim() &&
    !normalizedOptions.some(
      (option) =>
        option.value.toLocaleLowerCase("tr-TR") ===
          inputValue.trim().toLocaleLowerCase("tr-TR") ||
        option.label.toLocaleLowerCase("tr-TR") ===
          inputValue.trim().toLocaleLowerCase("tr-TR")
    );

  const allVisibleItems = useMemo(() => {
    const items = filteredOptions.map((option) => ({
      type: "option",
      option,
      key: `option-${option.id}`,
    }));

    if (canShowManualOption) {
      items.push({
        type: "manual",
        option: {
          id: "manual-entry",
          label: inputValue.trim(),
          value: inputValue.trim(),
        },
        key: "manual-entry",
      });
    }

    return items;
  }, [filteredOptions, canShowManualOption, inputValue]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
        setHasFocus(false);

        if (allowManualEntry && inputValue.trim() && !selectedValue) {
          const manualValue = inputValue.trim();
          setSelectedValue(manualValue);
          onChange?.(manualValue);
        }
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [allowManualEntry, inputValue, selectedValue, onChange]);

  useEffect(() => {
    if (!allVisibleItems.length) {
      setHighlightedIndex(-1);
      return;
    }

    setHighlightedIndex(0);
  }, [inputValue, allVisibleItems.length]);

  function emitValue(nextValue) {
    if (!isControlled) {
      setSelectedValue(nextValue);
    }

    onChange?.(nextValue);
  }

  function handleInputChange(event) {
    const nextValue = event.target.value;

    if (!isControlled) {
      setInputValue(nextValue);
      setSelectedValue("");
    } else {
      setInputValue(nextValue);
    }

    if (!nextValue.trim()) {
      emitValue("");
    }

    setIsOpen(true);
  }

  function handleSelect(option) {
    const nextValue = option.value;
    const nextLabel = option.label || option.value;

    if (!isControlled) {
      setInputValue(nextLabel);
      setSelectedValue(nextValue);
    } else {
      setInputValue(nextLabel);
    }

    emitValue(nextValue);
    setIsOpen(false);
    setHasFocus(false);
    inputRef.current?.focus();
  }

  function handleInputFocus() {
    setHasFocus(true);
    setIsOpen(true);
  }

  function handleInputBlur(event) {
    onBlur?.(event);
  }

  function handleKeyDown(event) {
    if (!isOpen && ["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
      setIsOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev < allVisibleItems.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : allVisibleItems.length - 1
      );
      return;
    }

    if (event.key === "Enter") {
      if (!isOpen) return;

      const selectedItem = allVisibleItems[highlightedIndex];

      if (selectedItem) {
        event.preventDefault();
        handleSelect(selectedItem.option);
        return;
      }

      if (allowManualEntry && inputValue.trim()) {
        event.preventDefault();
        handleSelect({
          label: inputValue.trim(),
          value: inputValue.trim(),
        });
      }

      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setHasFocus(false);
    }
  }

  const wrapperClassName = [
    "product-autocomplete",
    isOpen ? "product-autocomplete--open" : "",
    error ? "product-autocomplete--error" : "",
    disabled ? "product-autocomplete--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const shouldShowHint = Boolean(hint) && (hasFocus || isOpen);

  return (
    <div className={wrapperClassName} ref={rootRef}>
      <input
        type="hidden"
        name={name}
        value={isControlled ? value || "" : selectedValue || ""}
      />

      <div className="product-autocomplete__control">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          className="product-autocomplete__input"
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          className="product-autocomplete__toggle"
          aria-label="Ürün listesini aç"
          disabled={disabled}
          onClick={() => {
            inputRef.current?.focus();
            setHasFocus(true);
            setIsOpen((prev) => !prev);
          }}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M5 7.5 10 12.5 15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {shouldShowHint ? (
        <div className="product-autocomplete__hint">{hint}</div>
      ) : null}

      {isOpen ? (
        <div className="product-autocomplete__dropdown">
          <ul
            id={listboxId}
            role="listbox"
            className="product-autocomplete__list"
          >
            {allVisibleItems.length ? (
              allVisibleItems.map((item, index) => (
                <li key={item.key} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={highlightedIndex === index}
                    className={[
                      "product-autocomplete__option",
                      highlightedIndex === index
                        ? "product-autocomplete__option--active"
                        : "",
                      item.type === "manual"
                        ? "product-autocomplete__option--manual"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSelect(item.option);
                    }}
                  >
                    <span className="product-autocomplete__option-main">
                      {item.option.label}
                    </span>

                    <span className="product-autocomplete__option-meta">
                      {item.type === "manual"
                        ? "Manuel giriş"
                        : item.option.group || "Ürün"}
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="product-autocomplete__empty">{emptyMessage}</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}