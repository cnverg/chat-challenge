struct info {
	int sum;
	int b,e;
	int carry , hasCarry;
};
info join(info a, info b){
	info r;
	r.sum = a.sum + b.sum;
	r.b = a.b;
	r.e = b.e;
	r.carry = 0;
	r.hasCarry = 0;
	return r;
}

info createNode(int v,int b,int e){
	info r;
	r.sum = v;
	r.b = b;
	r.e = e;
	r.carry = 0;
	r.hasCarry = 0;
	return r;
}

info update_r(info v, int nv){ 
	//asignar (nv) a todos los del rango
	v.sum   += nv * (v.e - v.b + 1);
	v.carry += nv;;
	v.hasCarry = 1
	return v;
}

int arr[100010],N;
info tree[100010 * 4];
void create(int n = 1, int b = 0, int e = N-1){
	if(b == e){
		tree[n] = createNode(arr[i], b, e);
	}else{
		create(2*n, b, (b+e)/2);
		create(2*n+1, (b+e)/2+1, e);
		tree[n] = join(tree[2*n], tree[2*n+1]);
	}
}

info query(int i,int j,int n = 1, int b = 0, int e = N-1){
	if(i <= b && e <= j){
		return tree[n];
	}else{
		int m = (b+e)/2;
		// i'm going to use the childs
		if(tree[n].hasCarry){
			update_r(tree[2*n]  , tree[n].carry);
			update_r(tree[2*n+1], tree[n].carry);
			tree[n] = join(tree[2*n], tree[2*n+1]);
		}
		if(j <= m)return query(i,j,2*n, b, (b+e)/2);
		if(i >  m)return query(i,j,2*n+1,(b+e)/2,e);
		info f = query(i,j,2*n, b, (b+e)/2);
		info s = query(i,j,2*n+1,(b+e)/2,e);
		return join(f,s);
	}
}

void update(int i,int j,int v,int n = 1, int b = 0, int e = N-1){
	if(i <= b && e <= j){
		tree[n] = update_r(tree[n], v);
	}else{
		int m = (b+e)/2;
		// i'm going to use the childs
		if(tree[n].hasCarry){
			update_r(tree[2*n]  , tree[n].carry);
			update_r(tree[2*n+1], tree[n].carry);
			tree[n] = join(tree[2*n], tree[2*n+1]);
		}
		if(i <= m)update(i,j,v,2*n, b, (b+e)/2);
		if(j >= m)update(i,j,v,2*n+1,(b+e)/2,e);

	}
}

// [0 - 10] -> 5

// [0-2] ->5 , [3-8] -> 5 , [9-10] -> 5

// [4-5] -> 5 , ... entro