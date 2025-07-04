// src/hooks/useAsync.js
export const useAsync = (asyncFunction, dependencies = []) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null
  });

  const execute = useCallback(async (...args) => {
    setState({ loading: true, error: null, data: null });
    
    try {
      const result = await asyncFunction(...args);
      setState({ loading: false, error: null, data: result });
      return result;
    } catch (error) {
      setState({ loading: false, error, data: null });
      throw error;
    }
  }, dependencies);

  return { ...state, execute };
};