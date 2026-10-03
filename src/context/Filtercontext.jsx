import { createContext, useContext, useEffect, useState } from "react";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {

    const [filtersData, setFiltersData] = useState({});
    const [debouncedFilter, setDebouncedFilter] = useState({});
    
    const handlefilters = (key, value) => {
        if (key == 'search') {
            setDebouncedFilter(prev => ({
                ...prev,
                [key]: value
            }))
        } else {
            setFiltersData(prev => ({
                ...prev,
                [key]: value
            }))
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setFiltersData(debouncedFilter)
        }, 500)

        return () => clearTimeout(timer)
    }, [debouncedFilter])

    return (
        <FilterContext.Provider value={{ filtersData, handlefilters }}>
            {children}
        </FilterContext.Provider>
    )
}

export const filterState = () => useContext(FilterContext)